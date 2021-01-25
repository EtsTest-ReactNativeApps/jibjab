import React, { Component } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  LogBox,
} from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import MapView from "react-native-maps";
import CustomActions from "./CustomActions";

// require Firebase and Cloud Firestore
const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends Component {
  constructor(props) {
    super(props);
    // Creation of the state object in order to send, receive and display messages
    this.state = {
      messages: [],
      uid: 0,
      isConnected: false,
    };
    // Initialize Firebase and connect to Firestore database
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAqNQcJEL-24hdJWCJmzoUTLTu22sOZGE8",
        authDomain: "jibjab-9201c.firebaseapp.com",
        projectId: "jibjab-9201c",
        storageBucket: "jibjab-9201c.appspot.com",
        messagingSenderId: "477028533982",
        appId: "1:477028533982:web:64f410e0d74c73e44a244f",
        measurementId: "G-BFW368CEB3",
      });
    }
    this.referenceChatAppUser = null;
    // Create reference to Firestore 'messages' collection which stores and retreives messages the users send
    this.referenceMessages = firebase.firestore().collection("messages");

    LogBox.ignoreLogs([
      "Setting a timer for a long period of time",
      "undefined",
      "Animated.event now requires a second argument for options",
    ]);
  }

  // This function is fired when 'messages' collection changes.
  // Needs to retreive current data in 'messages' collection and store it in state 'messages', allowing that data to be rendered in view
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || "",
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  };

  // Add new messages to the database
  addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      uid: this.state.uid,
      image: message.image || "",
      location: message.location || null,
    });
  }
  // Custom function called when user sends a message
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }
  // Async functions
  getMessages = async () => {
    let messages = "";
    // wrap logic in try and catch so that errors can be caught
    try {
      // await used to wait until asyncStorage promise settles
      // Read messages in storage with getItem method (takes a key)
      messages = (await AsyncStorage.getItem("messages")) || [];
      // Give messages variable the saved data via setState
      this.setState({
        // Use JSON.parse to convert saved string back into an object
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  };

  // hide Input field when offline because messages can't be sent
  renderInputToolbar = (props) => {
    // console.log("Message from renderInputToolbar: " + this.state.isConnected);
    if (this.state.isConnected !== false) {
      return <InputToolbar {...props} />;
    }
  };

  // Change background color of sender's speech bubble
  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#454a52",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
        }}
      />
    );
  };

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ borderRadius: 13, height: 100, margin: 3, width: 150 }}
          showsUserLocation={true}
          region={{
            latitude: Number(currentMessage.location.latitude),
            longitude: Number(currentMessage.location.longitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  // Called as soon as Chat component mounts
  componentDidMount() {
    // displays user's name in navigation bar
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
    // Check connection status once
    NetInfo.fetch().then((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
    });

    // Subscribe to updates about the network state (allows to perform actions) anytime network state changes)
    NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected;
      if (isConnected == true) {
        this.setState({
          isConnected: true,
        });
      } else {
        this.setState({
          isConnected: false,
        });
      }
    });

    NetInfo.fetch().then((state) => {
      const isConnected = state.isConnected;
      if (isConnected == true) {
        this.setState({
          isConnected: true,
        });
        // Listen to authentication events
        // onAuthStateChanged() function called when user's sign-in state changes, returns unsubscribe() function, provides you with user object
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              try {
                await firebase.auth().signInAnonymously();
              } catch (error) {
                console.error(error.message);
              }
            }

            // update user state with currently active user data
            this.setState({
              uid: user.uid,
              messages: [],
            });

            // Create a reference to active user's documents (messages). User can see all messages
            this.referenceChatAppUser = firebase
              .firestore()
              .collection("messages")
              .orderBy("createdAt", "desc");

            // Listen for collection changes for current user
            this.unsubscribeChatAppUser = this.referenceChatAppUser.onSnapshot(
              this.onCollectionUpdate
            );
          });
      } else {
        this.setState({
          isConnected: false,
        });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    // Stop listening to authentication
    this.authUnsubscribe();
    // Stop listening for changes
    this.unsubscribeChatAppUser();
  }
  // Code for rendering chat interface with GiftedChat component
  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: this.props.route.params.color },
          ]}
        >
          <GiftedChat
            renderBubble={this.renderBubble}
            renderInputToolbar={this.renderInputToolbar.bind(this)}
            renderActions={this.renderCustomActions}
            renderCustomView={this.renderCustomView}
            messages={this.state.messages}
            onSend={(messages) => this.onSend(messages)}
            user={{
              _id: this.state.uid,
              avatar: "https://placeimg.com/140/140/any",
              name: this.props.route.params.name,
            }}
            renderUsernameOnMessage={true}
          />
          {/* Make sure that keyboard and message input field display correctly in Android OS */}
          {Platform.OS === "android" ? (
            <KeyboardAvoidingView behavior="height" />
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
});
