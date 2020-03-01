import React, { Component } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Plotly from 'react-native-plotly';

// World bank API, fetch 400 per page, meaning that we get the whole country list
const countryListUrl = 'https://api.worldbank.org/v2/country?format=json&per_page=400';
const countryBaseUrl = 'https://api.worldbank.org/v2/country/';
// Population time series indicator (World Bank API)
const indicator = 'SP.POP.TOTL';

export default class CountryList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      dataSource: null,
      country: null,
      countryName: null,
      countryLabels: null,
      countryTimeSeries: null
    }
  }

  async componentDidMount() {
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
          console.log('Error with fetching country list')
        }
      }
    }
    catch (error) {
      console.log(error)
    };
  }

  render() {

    if (this.state.isLoading && this.state.dataSource == null) {
      return (
        <View style={styles.container}>
          <Text style={styles.waitingText}>Loading country list</Text>
          <ActivityIndicator />
        </View>
      )
    }

    else if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <Button
            style={styles.selectCountryButton}
            title="Select country"
            disabled
          />
          <Text style={styles.waitingText}>Loading country data for: {this.state.countryName} </Text>
          <ActivityIndicator />
        </View>
      )
    }

    else if (this.state.country === null) {
      return (
        <View style={styles.container}>
          <Button
            style={styles.selectCountryButton}
            title="Select country"
            disabled
          />
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
          <Button
            style={styles.selectCountryButton}
            title="Select country"
            disabled
          />
          <ActivityIndicator />
        </View>
      )
    }

    else {
      const data = [{
        x: this.state.countryLabels,
        y: this.state.countryTimeSeries,
        fill: 'tozeroy',
        type: 'scatter',
      }];
      const layout = { title: 'Population count / ' + this.state.countryName };

      return (
        <View style={styles.container}>
          <Button
            style={styles.selectCountryButton}
            title="Select country"
            onPress={() => this.setState({
              isLoading: false,
              country: null,
              countryName: null,
              countryLabels: null,
              countryTimeSeries: null
            }, function () { })}
          />
          <Plotly
            data={data}
            layout={layout}
            config={{displayModeBar: false}}
          />
        </View>
      )
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

function sortCountriesAlphabeticallyByName(a, b) {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}

function getValues(data) {
  var vals = data[1].sort((a, b) => a.date - b.date).map(item => item.value);
  return vals;
}

function getLabels(data) {
  var labels = data[1].sort((a, b) => a.date - b.date).map(item => item.date);
  return labels;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  waitingText: {
    alignSelf: 'center',
    fontSize: 16,
    color: 'gray',
    padding: 20
  },
  selectCountryButton: {
    padding: 20
  },
  item: {
    padding: 5,
    fontSize: 16,
    height: 35,
  },
});
