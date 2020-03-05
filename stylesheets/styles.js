import { StyleSheet } from 'react-native';
import {Dimensions } from "react-native";

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const minDimension = Math.min(screenWidth, screenHeight);

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    header: {
        flex: 3,
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center', 
        alignItems: 'center'
    },
    headerText: {
        fontFamily: 'sans-serif-condensed',
        color: 'white',
        fontSize: 0.05 * minDimension,
        fontWeight: 'bold'
    },
    footer: {
        flex: 2,
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center', 
        alignItems: 'center'
    },
    footerText: {
        fontFamily: 'sans-serif-condensed',
        color: 'white',
        fontSize: 0.03 * minDimension,
    },
    container: {
        flex: 30
    },
    graphContainer: {
        flex: 1,
        marginHorizontal: 0,
        justifyContent: 'center', 
        alignItems: 'center'
    },
    waitingText: {
        fontFamily: 'sans-serif-condensed',
        alignSelf: 'center',
        fontSize: 16,
        color: 'gray',
        padding: 20
    },
    errorMainText: {
        fontFamily: 'sans-serif-condensed',
        alignSelf: 'center',
        fontSize: 16,
        color: 'red',
        padding: 20
    },
    errorStatusText: {
        fontFamily: 'sans-serif-condensed',
        alignSelf: 'center',
        fontSize: 12,
        color: 'red',
        padding: 20
    },
    selectCountryButton: {
        color: 'rgb(95, 21, 58)'
    },
    item: {
        fontFamily: 'sans-serif-condensed',
        paddingLeft: 20,
        fontSize: 16,
        height: 25,
    }
});

const graphStyles = {
    graphLineColor: 'rgb(95, 21, 58)',
    graphFillColor: 'rgba(95, 21, 58, 0.4)'
}

export {styles, graphStyles}
