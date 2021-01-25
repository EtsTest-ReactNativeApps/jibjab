import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
const firebase = require("firebase");

export default class CustomActions extends Component {
  constructor() {
    super();
  }

  // Defines an array of strings to be displayed in the ActionSheet as well as an cancel button for which need to determine its position
  onActionPress = () => {
    const options = [
      "Choose Picture From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    // defines positon of cancel button at the end of ActionSheet
    const cancelButtonIndex = options.length - 1;
    this.context
      .actionSheet()
      .showActionSheetWithOptions(
        { options, cancelButtonIndex },
        async (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              return this.pickImage();
            case 1:
              return this.takePhoto();
            case 2:
              return this.getLocation();
            default:
          }
        }
      );
  };

  pickImage = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status === "granted") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  takePhoto = async () => {
    try {
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );

      if (status === "granted") {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  getLocation = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);

      if (status === "granted") {
        let result = await Location.getCurrentPositionAsync({});
        const longitude = JSON.stringify(result.coords.longitude);
        const latitude = JSON.stringify(result.coords.latitude);

        if (result) {
          this.props.onSend({
            location: {
              longitude,
              latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Upload image to Firebase as blob in order to store it in database to make it visible in chat
  uploadImage = async (uri) => {
    try {
      // Before upload, need to convert file into a blob
      const blob = await new Promise((resolve, reject) => {
        // Create new XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        // Set responseType to 'blob
        xhr.responseType = "blob";
        // Open connection and retrieve URI's data (=image)
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
      // Create unique file names for each image depending on uri
      let uriSections = uri.split("/");
      let imageName = uriSections[uriSections.length - 1];

      // Create reference to the storage and use put to store content retrieved form request
      const ref = firebase.storage().ref().child(`${imageName}`);
      const snapshot = await ref.put(blob);

      // Close connection
      blob.close();

      // Retrieve image's URL from the server
      return await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <TouchableOpacity
        style={[styles.container]}
        accessibilityLabel="Action button"
        accessibilityHint="Choose whether to pick an image, take a photo or send your location"
        // When user presses button, onActionPress is called, which creates an ActionSheet that displays set of actions
        onPress={this.onActionPress}
      >
        <View style={[styles.actionButton, this.props.actionButtonStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 26,
    marginBottom: 10,
    marginLeft: 10,
    width: 26,
  },
  actionButton: {
    borderColor: "#b2b2b2",
    borderRadius: 13,
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    backgroundColor: "transparent",
    color: "#b2b2b2",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

// GiftedChat expects actionSheet to be a function
CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
