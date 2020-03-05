import React, { Component } from 'react';
import { ActivityIndicator, Button, FlatList, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { styles, graphStyles } from "./stylesheets/styles"

// World bank API, fetch 400 per page, meaning that we get the whole country list
const countryListUrl = 'https://api.worldbank.org/v2/country?format=json&per_page=400';
const countryBaseUrl = 'https://api.worldbank.org/v2/country/';
// Population time series indicator (World Bank API)
const indicator = 'SP.POP.TOTL';

export default class MainContainer extends Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <Header />
        <CountryList />
        <Footer />
      </View>
    );
  }
}

class Header extends Component {
  render() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Population graphs</Text>
      </View>
    );
  }
}

class Footer extends Component {
  render() {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>Population data: World Bank (CC BY 4.0)</Text>
      </View>
    );
  }
}

class CountryList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      dataSource: null,
      country: null,
      countryName: null,
      countryLabels: null,
      countryTimeSeries: null,
      screenHeight: Dimensions.get('screen').height,
      screenWidth: Dimensions.get('screen').width
    }
  }

  async componentDidMount() {
    Dimensions.addEventListener('change', () => {
      this.setState({
        screenHeight: Dimensions.get('screen').height,
        screenWidth: Dimensions.get('screen').width
      });
    });

    try {
      var response = await fetch(countryListUrl);

      if (!response.ok) {
        throw Error(response.statusText);
      }
      else {
        if (response.status == 200) {
          console.log('Got Countrylist response')
          var countryData = await response.json();
          var countryList = countryData[1].sort(sortCountriesAlphabeticallyByName);

          // Skip aggregate areas such as "EU" and "EMU area"
          countryList = countryList.filter((cntry) => cntry.capitalCity !== '');

          this.setState({
            isLoading: false,
            dataSource: countryList,
          }, function () { });

        } else {
          console.log('Error with fetching country list');
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  render() {
    if (this.state.isLoading && this.state.dataSource == null) {
      return (
        <View style={styles.container}>
          <DisabledButton />
          <Text style={styles.waitingText}>Loading country list</Text>
          <ActivityIndicator />
        </View>
      )
    }

    else if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <DisabledButton />
          <Text style={styles.waitingText}>Loading country data for: {this.state.countryName} </Text>
          <ActivityIndicator />
        </View>
      )
    }

    else if (this.state.country === null) {
      return (
        <View style={styles.container}>
          <DisabledButton />
          <FlatList
            data={this.state.dataSource}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback onPress={() => this.actionOnRow(item)}>
                <Text style={styles.item}>{item.name}, {item.id}</Text>
              </TouchableWithoutFeedback>
            )}
            keyExtractor={({ id }, index) => id}
          />
        </View>
      );
    }

    else if (this.state.countryTimeSeries === null) {
      return (
        <View style={styles.container}>
          <DisabledButton />
          <ActivityIndicator />
        </View>
      )
    }

    else {
      const data = {
        labels: this.state.countryLabels.map(label => keepZeroEndingLabel(label)),
        datasets: [
          {
            data: this.state.countryTimeSeries,
            color: () => graphStyles.graphLineColor,
            strokeWidth: 1 // optional
          }
        ],
        legend: ['Population count / ' + this.state.countryName] // optional
      };
      const chartConfig = {
        backgroundGradientFrom: "#1E2923",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#08130D",
        backgroundGradientToOpacity: 0,
        color: () => graphStyles.graphLineColor,
        decimalPlaces: 0,
        propsForBackgroundLines: { strokeDasharray: '0, 10' },
      };
      return (
        <View style={styles.container}>
          <Button
            color={styles.selectCountryButton.color}
            title='Select country'
            onPress={() => this.setState({
              isLoading: false,
              country: null,
              countryName: null,
              countryLabels: null,
              countryTimeSeries: null
            }, function () { })}
          />
          <View style={styles.graphContainer}>
            <LineChart
              data={data}
              height={0.6 * this.state.screenHeight}
              width={0.9 * this.state.screenWidth}
              chartConfig={chartConfig}
              formatYLabel={formatYLabels}
              fromZero={true}
              withDots={false}
              xAxisInterval={100}
              yAxisInterval={100}
            />
          </View>

        </View>
      );
    }
  }

  actionOnRow(item) {
    this.fetchChartData(item.id, indicator);
    this.setState({
      isLoading: true,
      dataSource: this.state.dataSource,
      country: item.id,
      countryName: item.name
    }, function () { });
  }

  setChartData(countryTimeSeries, labels) {
    this.setState({
      isLoading: false,
      countryLabels: labels,
      countryTimeSeries: countryTimeSeries
    }, function () { });
  }

  async fetchChartData(countryCode, indicatorCode) {
    const countrySpecificUrl = countryBaseUrl + countryCode + '/indicator/' + indicatorCode + '?format=json&&per_page=60'

    try {
      var response = await fetch(countrySpecificUrl);

      if (!response.ok) {
        throw Error(response.statusText);
      }
      else {
        if (response.status == 200) {
          var fetchedData = await response.json();

          if (fetchedData[0].message) {
            throw (fetchedData[0].message);
          }

          var data = getValues(fetchedData);
          var labels = getLabels(fetchedData);
          this.setChartData(data, labels);
        } else {
          console.log('Fetching population data from server failed');
          this.resetState();
        }
      }
    }
    catch (error) {
      console.log('Fetching population data from server failed');
      this.resetState();
    }
  }

  resetState() {
    this.setState({
      isLoading: false,
      country: null,
      countryName: null,
      countryLabels: null,
      countryTimeSeries: null
    })
  }
}

function DisabledButton() {
  return (
    <Button
      color={styles.selectCountryButton.color}
      title="Select country"
      disabled
    />
  );
}

function sortCountriesAlphabeticallyByName(a, b) {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}

function getValues(data) {
  var dataSorted = sortAndCropData(data);
  var vals = dataSorted.map(item => item.value);

  return vals;
}

function getLabels(data) {
  var dataSorted = sortAndCropData(data);
  var labels = dataSorted.map(item => item.date);
  return labels;
}

function sortAndCropData(data) {
  var dataSorted = data[1].sort((a, b) => a.date - b.date);
  if (dataSorted[dataSorted.length - 1].value == null) {
    dataSorted = dataSorted.slice(0, dataSorted.length - 1);
  }
  return dataSorted;
}

function keepZeroEndingLabel(label) {
  if (label.endsWith('0')) {
    return label
  } else {
    return ''
  }
}

function formatYLabels(label) {
  if (label.length > 8) {
    return (label.substring(0, label.length - 6) + ' M');
  } else if (label.length > 4) {
    return (label.substring(0, label.length - 3) + ' k');
  } else {
    return label;
  }

}