import React from "react";
import {
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const image = require("../assets/backgroundImage.png");

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "", color: "" };
  }
  render() {
    return (
      <ImageBackground source={image} style={styles.image}>
        <Text style={styles.title}>jibjab</Text>
        <View style={styles.container}>
          <TextInput
            style={styles.nameInput}
            onChangeText={(name) => this.setState({ name })}
            value={this.state.name}
            placeholder="Enter Your Name"
          />
          <Text style={styles.chooseColorText}>Choose Background Color:</Text>
          <View style={styles.colorChoices}>
            <TouchableOpacity
              style={[styles.color, { backgroundColor: "#9ac8fc" }]}
              onPress={() => {
                this.setState({ color: "#9ac8fc" });
              }}
            />
            <TouchableOpacity
              style={[styles.color, { backgroundColor: "#f2bab8" }]}
              onPress={() => {
                this.setState({ color: "#f2bab8" });
              }}
            />
            <TouchableOpacity
              style={[styles.color, { backgroundColor: "#090C08" }]}
              onPress={() => {
                this.setState({ color: "#090C08" });
              }}
            />
            <TouchableOpacity
              style={[styles.color, { backgroundColor: "#b9c6ae54" }]}
              onPress={() => {
                this.setState({ color: "#b9c6ae54" });
              }}
            />
          </View>
          <View style={styles.chatButtonView}>
            <Button
              title="Start Chatting"
              //sets color/name states for Chat screen
              onPress={() =>
                this.props.navigation.navigate("Chat", {
                  name: this.state.name,
                  color: this.state.color,
                })
              }
            />
          </View>
        </View>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  chatButtonView: {
    width: "88%",
    height: "21%",
    justifyContent: "center",
    alignItems: "center",
    margin: 15,
  },
  chooseColorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757083",
    marginBottom: 20,
    alignItems: "center",
  },
  color: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    margin: 10,
    marginTop: 5,
  },
  colorChoices: {
    flex: 4,
    flexDirection: "row",
    margin: 10,
    alignItems: "center",
    marginTop: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    height: "44%",
    width: "88%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
  },
  nameInput: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    width: "90%",
    height: "20%",
    marginBottom: 30,
    marginTop: 16,
    paddingLeft: 32,
    borderColor: "#757083",
    borderWidth: 1.5,
    borderRadius: 2,
    opacity: 50,
  },
  title: {
    flex: 1,
    fontSize: 45,
    fontWeight: "600",
    color: "#ffffff",
    alignSelf: "center",
    marginTop: 100,
  },
});
