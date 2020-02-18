import React, { Component } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";

export default class CountryList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      dataSource: null,
      country: null,
      labels: null,
      countryTimeSeries: null
    }
  }

  async componentDidMount() {
    // World bank API, fetch 400 per page, meaning that we get the whole country list
    const url = 'https://api.worldbank.org/v2/country?format=json&per_page=400';

    try {
      var response = await fetch(url);

      if (!response.ok) {
        throw Error(response.statusText);
      }
      else {
        if (response.status == 200) {
          console.log('Got Countrylist response')
          var countryData = await response.json();
          var countryList = countryData[1].sort(sortCountriesAlphabeticallyByName);

          this.setState({
            isLoading: false,
            dataSource: countryList,
          }, function () { });

        } else {
          console.log('Error with fetching country list')
        }
      }
    }
    catch (error) {
      console.log(error)
    };
  }

  render() {

    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator />
        </View>
      )
    }

    else if (this.state.country === null) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
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
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator />
        </View>
      )
    }

    else {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Text>Got country data {this.state.countryTimeSeries[0]}</Text>
        </View>
      );
    }

  }

  actionOnRow(item) {
    const indicator = 'SP.POP.TOTL';
    console.log('Selected Item :', item.id);
    this.fetchDataAndRenderGraph(item.id, indicator);
    this.setState({
      isLoading: true,
      dataSource: this.state.dataSource,
      country: item.id
    }, function () { });
  }

  setChartData(countryTimeSeries, labels) {
    console.log('Rendering Chart with data ' + countryTimeSeries[0] + '... and labels ' + labels[0] + '...')
    this.setState({
      isLoading: false,
      labels: labels,
      countryTimeSeries: countryTimeSeries
    }, function () { });
  }
  
  async fetchDataAndRenderGraph(countryCode, indicatorCode) {
    const baseUrl = 'https://api.worldbank.org/v2/country/'
    const url = baseUrl + countryCode + '/indicator/' + indicatorCode + '?format=json'
  
    //clearChart();
  
    try {
      var response = await fetch(url);
  
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
        }
      }
    }
    catch (error) {
      console.log('Fetching population data from server failed');
    };
  }
}

function sortCountriesAlphabeticallyByName(a, b) {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}

// Not being used yet. TODO: extract styles to StyleSheet.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22
  },
  item: {
    padding: 5,
    fontSize: 16,
    height: 35,
  },
});

function getValues(data) {
  var vals = data[1].sort((a, b) => a.date - b.date).map(item => item.value);
  return vals;
}

function getLabels(data) {
  var labels = data[1].sort((a, b) => a.date - b.date).map(item => item.date);
  return labels;
}

