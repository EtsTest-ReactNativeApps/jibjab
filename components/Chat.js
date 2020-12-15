import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";

export default class Chat extends Component {
  render() {
    //access name and color props from StartScreen
    let { name, color } = this.props.route.params;
    this.props.navigation.setOptions({ title: name, backgroundColor: color });

    return (
      <View style={[styles.container, { backgroundColor: color }]}>
        <Text style={styles.welcomeText}>Hello from ChatScreen</Text>
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
