/*
 * APIKEY: SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k
 * SECRET: 3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7
 * 
 * Made by : Rúben Gomes 2220859
 * This is the main file for the petfile application where all the functions are defined and commented
 * 
 */

const TOKENURL = 'https://api.petfinder.com/v2/oauth2/token';
// const APIURL = 'https://api.petfinder.com/v2/animals'; Not using this because we are using the complete url on fetch

class AppState {
  constructor() {
    // Singleton : This wil ensure that there is only one instance of the class
    // This is important because we want to have only one state for the application
    if(AppState.instance){
      return AppState.instance;
    }
    // If there is no instance of the class we will create one
    AppState.instance = this;
    this.loadState();

    if(!this.state.favoritePets) this.state.favoritePets = [];

    if(!this.state.currentSearch) this.state.currentSearch = "";
    if(!this.state.currentDetails) this.state.currentDetails = "";

  }

  loadState(){
    this.state = JSON.parse(localStorage.getItem('state')) ?? {};
  }

  saveState(){
    localStorage.setItem('state', JSON.stringify(this.state));
  }

  getFavorites(){
    return this.state.favoritePets ?? [];
  }

/*
 * Function to add favorites
 * @param {string} petName
 */

  addFavorites(petName){
    if(this.state.favorites.includes(petName)) return;
    this.state.favorites.push(petName);
  }

/*
 * Function to remove favorites
 * @param {string} petName
 */

  removeFavorites(petName){
    this.state.favorites = this.state.favorites.filter(pet => pet !== petName);
  }

/*
 * Function to clear favorites
 */

  clearFavorites(){
    this.state.favorites = [];
  }

  /*
   * Function to set current search
   * @param {string} petName
   */
  setSearch(petName){
    this.state.currentSearch = petName;
  }

  /*
   * Function to set currrent details 
   * @param {string} petName
   */
  setDetails(petName){
    this.state.currentDetails = petName;
  }

} // end of class AppState

class PetInterface {

  constructor(APIID, SECRET){
    this.apiKey = APIID || 'SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k'; // API key
    this.secret = SECRET || '3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7'
    this.token = null;
    this.lastError = null;
  }

/*
 * Creating function to authenticate API key
 */

  async getToken(){
    let response = await fetch($TOKEN_URL, {
      headers: {
        'grant_type': 'client_credentials',
        'client_id': this.apiKey,
        'client_secret': this.secret
      }
    });
    let data = await response.json();
    if(data.access_token){
      this.token = data.access_token; // store token
    })
  }

  async fetchDataUsingName(petName){
    let response = await fetch(`https://api.petfinder.com/v2/animals?name=${petName}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    let data = await response.json();
    if(data.status === 404){
      this.lastError = data;
      return null;
    }
    return data;
  }


  getId(data){
    return data.id;
  }

  getName(data){
    return data.name;
  }

  getAge(data){
    return data.age;
  }

  getGender(data){
    return data.gender;
  }

  getBreed(data){
    return data.breeds.primary;
  }

  getColors(data){
    return data.colors.primary;
  }

  getPhoto(data, size = 'medium'){
    return data.photos[0].size;
  }
    


} // end of class PetInterface

class MainFile {
  
  document.addEventListener('DOMContentLoaded', () => {
      
      const appState = new AppState();
      const petInterface = new PetInterface();
      
      

  });
  

  const placeDogs = (dogs, petInterface, appState) => {
  


  }

}

 

} // end of class PetFile
