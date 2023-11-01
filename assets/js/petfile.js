class AppState {
  constructor() {
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

  constructor(APIID){
    this.apiKey = APIID || ;
    this.lastError = null;
  }

/*
 * Creating function to authenticate API key
 */
  async fetchDataUsingName(petName){
    let response = await fetch(`https://api.petfinder.com/v2/animals?name=${petName}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    let data = await response.json();
    if(data.status === 404){
      this.lastError = data;
      return null;
    }
    return data;
  }

  async fetchDataUsingId(idPet){
    let responde = await fetch(`https://api.petfinder.com/v2/animals/${idPet}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
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

class PetFile {

} // end of class PetFile
