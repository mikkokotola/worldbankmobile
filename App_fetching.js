import React, { Component } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default class CountryList extends Component {
  constructor(props){
    super(props);
    this.state ={ isLoading: true}
  }

  async componentDidMount(){
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
                countryList = countryData[1].sort(sortCountriesAlphabeticallyByName); 
                
                this.setState({
                  isLoading: false,
                  dataSource: countryList,
                }, function(){});
                
            } else {
                console.log('Error with fetching country list')
            }
        }
    }
    catch (error) {
        console.log(error)
    };
  }

  render(){

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return(
      <View style={{flex: 1, paddingTop:20}}>
        <FlatList
          data={this.state.dataSource}
          renderItem={({item}) => <Text>{item.name}, {item.id}</Text>}
          keyExtractor={({id}, index) => id}
        />
      </View>
    );
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
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})