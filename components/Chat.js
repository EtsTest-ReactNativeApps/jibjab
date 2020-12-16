import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    };
  }

  componentDidMount() {
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
    this.setState({
      messages: [
        {
          _id: 1,
          text: `Hello, ${this.props.route.params.name}. Welcome to the chat!`,
          createdAt: new Date(),
          system: true,
        },
        {
          _id: 2,
          text: "Good morning!",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Greg Vincent",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
      ],
    });
  }

  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000",
          },
        }}
      />
    );
  }

  render() {
    //access name and color props from StartScreen
    let { color } = this.props.route.params;

    return (
      <View style={[styles.container, { backgroundColor: color }]}>
        {/* <Text style={styles.welcomeText}>Hello from ChatScreen</Text> */}
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {/* For android os only so that pop-up keyboard doesn't block view of chat input */}
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    color: "#dd1616",
    fontSize: 20,
  },
});
