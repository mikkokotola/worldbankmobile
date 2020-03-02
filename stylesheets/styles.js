import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    header: {
        flex: 3,
        width: '100%',
        backgroundColor: 'black',
        textAlign: 'center'
    },
    headerText: {
        fontFamily: 'sans-serif-condensed',
        alignSelf: 'center',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        padding: 20
    },
    footer: {
        flex: 2,
        width: '100%',
        backgroundColor: 'black',
        textAlign: 'center'
    },
    footerText: {
        fontFamily: 'sans-serif-condensed',
        alignSelf: 'center',
        color: 'white',
        padding: 5
    },
    container: {
        flex: 30,
        paddingLeft: 20,
        paddingRight: 20
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
        padding: 3,
        fontSize: 16,
        height: 25,
    }
});

const graphStyles = {
    graphLineColor: 'rgb(95, 21, 58)',
    graphFillColor: 'rgba(95, 21, 58, 0.4)'
}

export {styles, graphStyles}
