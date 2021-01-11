import React, { Component } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { decode, encode } from "base-64";
// only for android
import KeyboardSpacer from "react-native-keyboard-spacer";

// require Firebase and Cloud Firestore
const firebase = require("firebase");
require("firebase/firestore");

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

export default class Chat extends Component {
  constructor(props) {
    super(props);
    // Creation of the state object in order to send, receive and display messages
    this.state = {
      messages: [],
      uid: 0,
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
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
      uid: this.state.uid,
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
      }
    );
  }
  // Change background color of sender's speech bubble
  renderBubble(props) {
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
  }
  // display user name in navigation bar
  static navigationOptions = ({ navigation }) => {
    return {
      title: this.props.route.params.name,
    };
  };
  // Code for rendering chat interface with GiftedChat component
  // ----- !!!
  // Don't forget to add accesibilityLabel and accessibilityHint for screenreacers to action button in input field
  /// ----- !!!
  render() {
    let { color } = this.props.route.params;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={[styles.container, { backgroundColor: color }]}>
          <GiftedChat
            renderBubble={this.renderBubble}
            messages={this.state.messages}
            onSend={(messages) => this.onSend(messages)}
            user={{
              _id: this.state.uid,
              avatar: "https://placeimg.com/140/140/any",
              name: this.props.route.params.name,
            }}
          />
          {/* Make sure that keyboard and message input field display correctly in Android OS */}
          {Platform.OS === "android" ? <KeyboardSpacer /> : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
  // Called as soon as Chat component mounts
  componentDidMount() {
    // Listen to authentication events
    // Calling Firebase Auth service with firebase.auth()
    // onAuthStateChanged() function called when user's sign-in state changes, returns unsubscribe() function, provides you with user object
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      // update user state with currently active user data
      this.setState({
        uid: user.uid,
        messages: [],
      });
      // Create a reference to acitve user's documents (messages). User can see all messages
      this.referenceChatAppUser = firebase.firestore().collection("messages");
      // Listen for collection changes for current user
      this.unsubscribeChatAppUser = this.referenceChatAppUser.onSnapshot(
        this.onCollectionUpdate
      );
    });
    // Set the state with a static system message to tell user has entered the chat
    this.setState({
      // Messages must follow a certain format to work with Gifted Chat library: ID, creation date, user object (user ID, name, avatar)
      messages: [
        {
          _id: 2,
          text: `${this.props.route.params.name} has entered the chat`,
          createdAt: new Date(),
          system: true,
        },
      ],
    });
  }
  componentWillUnmount() {
    // Stop listening to authentication
    this.authUnsubscribe();
    // Stop listening for changes
    this.unsubscribeChatAppUser();
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
