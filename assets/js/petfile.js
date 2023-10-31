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
  
  addFavorites(petName){
    if(this.state.favorites.includes(petName)) return;
    this.state.favorites.push(petName);
  }

  removeFavorites(petName){
    this.state.favorites = this.state.favorites.filter(pet => pet !== petName);
  }

  clearFavorites(){
    this.state.favorites = [];
  }

  setSearch(petName){
    this.state.currentSearch = petName;
  }

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
  async getPet(petName){
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




} // end of class PetInterface

class PetFile {

} // end of class PetFile
