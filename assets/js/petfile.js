/*
 * APIKEY: SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k
 * SECRET: 3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7
 * 
 * Made by : Rúben Gomes 2220859
 * This is the main file for the petfile application where all the functions are defined and commented
 * 
 */

const ERROR_CODES = {
  OK: 200,
  INVALID_CREDENTIALS: 401,
  INSUFFICIENT_PERMISSIONS: 403,
  NOT_FOUND: 404,
  UNPEXCETED_ERROR: 500,
  MISSING_PARAMETERS: 00001,
  INVALID_PARAMETERS: 00002
};


const MAX_TRIES = 3;
const TOKEN_URL = 'https://api.petfinder.com/v2/oauth2/token';
// const API_URL = 'https://api.petfinder.com/v2/animals'; Not using this because we are using the complete url on fetch

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
    this.apiKey = APIID || "SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k"; // API key
    this.secret = SECRET || "3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7"; // Secret key
    this.token = null;
    this.lastError = null;
  }

/*
 * Creating function to authenticate API key
 */
  //
  // async updateAccessToken(){
  //   let response = await fetch(TOKEN_URL, {
  //     method: 'POST',
  //     mode: 'cors', // no-cors, *cors, same-origin'
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     body: `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secret}`
  //   });
  //   let data = await response.json();
  //   if(data.access_token){
  //    this.token = data.access_token; // store token
  //   }
  // }
  //
  async updateAccessToken(){
    $.ajax({
      url: `${TOKEN_URL}`,
      type: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic Og=="
      },
      processData: false,
      data:
        "{\n\t\"grant_type\": \"client_credentials\",\n\t\"client_id\": \"SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k\",\n\t\"client_secret\": \"3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7\"\n}"    
      }).done(function(response) {
        this.token = response.access_token;
      }).fail(function(error){
        console.log(error);
      });
  }

  async fetchPetByName(name){
    this.updateAccessToken();
    $.ajax({
      url: `https://api.petfinder.com/v2/animals/`,
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      success: function(data){
        return data;
      },
      error: function(error){
        if(data.status === ERROR_CODES.INVALID_CREDENTIALS){
          this.updateAccessToken();
          console.log(this.access_token);
        }
      }
    });
  }

  static getPetId(data){
    return data.id;
  }

  static getPetName(data){
    return data.name;
  }

  static getPetAge(data){
    return data.age;
  }

  static getPetGender(data){
    return data.gender;
  }

  static getPetBreed(data){
    return data.breeds.primary;
  }

  static getPetColors(data){
    return data.colors.primary;
  }

  static getPetPhoto(data, size = 'medium'){
    return data.photos[0].size;
  }
    


} // end of class PetInterface


// Main File --> Index.html
document.addEventListener('DOMContentLoaded', () => {
      
      const appState = new AppState();
      const petInterface = new PetInterface();
   
      petInterface.fetchPetByName("Bella");

      //placeDogs(["beagle", "Boxer"], petInterface, appState);
});
  
//
//   const placeDogs = (dogs, petInterface, appState) => {
//     
//     const template = document.querySelector('#template-pet');
//     
//     let petData;
//
//     dogs.forEach(async (dog) => {
//     
//       petData = await petInterface.fetchPetByName(dog);
//
//       const petsCard = template.content.cloneNode(template.content,true);
//
//       const petCard = petsCard.getElementById('pet');
//  
//       const petName = petCard.children[0];
//       const petAge = petCard.children[1];
//       const petGender = petCard.children[2];
//       const petBreed = petCard.children[3];
//
//       PetInterface.getPetName(petData).then(name => {
//         petName.innerHTML = `Nome: ${name}`;
//       });
//
//       PetInterface.getPetAge(petData).then(age => {
//         petAge.innerHTML = `Anos: ${age}`;
//       });
//
//       PetInterface.getPetBreed(petData).then(breed => {
//         petBreed.innerHTML = `Raça: ${breed}`;
//       });
//       
//       PetInterface.getPetGender(petData).then(gender => {
//         petGender.innerHTML = `Genero: ${gender}`;
//       });
//
//
//
//     });
//
// } // end of placeDogs function
//
 



// End of Main File --> Index.html

