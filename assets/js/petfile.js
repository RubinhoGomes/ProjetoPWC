/*
 * APIKEY: SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k
 * SECRET: 3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7
 * 
 * Made by : Rúben Gomes 2220859
 * Este ficheiro contem todo o codigo para a aplicação funcionar, desde a classe AppState, até as funções que fazem os pedidos a API
 * Qualquer duvida na implementação deste codigo podem ser esclarecidas com os desenvolvedores do projeto
 *
 *
 * ##############
  *  CONSTANTS *
 * ##############
 */

/*
 * Codigos de erros que são retornados pela API
 * Estes codigos são usados para saber o que fazer quando um erro é retornado
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

/*
 * Max Tries é utilizado para o numero de tentivas que a aplicação faz para obter um animal
 * Token URL é o url para obter o token de acesso a API
 * API_URL é o url para obter os animais (não estamos a usar este url porque estamos a usar o url completo no fetch)
 */
const MAX_TRIES = 3;
const TOKEN_URL = 'https://api.petfinder.com/v2/oauth2/token/';
const API_URL = 'https://api.petfinder.com/v2/';


/*
 * Class AppState
 * Esta classe instancia um Singleton (Explicada em ingles abaixo)
 * Esta classe é responsavel por guardar o estado da aplicação
 */
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


/*
 * Class PetInterface
 * Esta classe é responsável por fazer a comunicação com a API do PetFinder
 * Tem metodos para facilitar a recolha de dados dos animas consoante o necessario
 */
class PetInterface {

    constructor(){
    this.apiKey = "SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k"; // API key
    this.secret = "3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7"; // Secret key
    this.token = null;
    this.lastEror = null;
  }

/*
 * Função para obter o token de acesso 
 * Este token é necessário para fazer pedidos à API 
 * Type -> Post 
 * crossDomain -> true (necessário para o CORS)
 * headers -> Content-Type: application/json
 * headers -> Authorization: Basic Og== (necessário para a autenticação)
 * processData -> false (necessário para o CORS, e a data inves de ser processada em JSON é enviada como string)
 */
   
  async updateAccessToken(){
    $.ajax({
      async: false,
      url: `${TOKEN_URL}`,
      type: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic Og=="
      },
      processData: false,
      data:
        '{\n\t\"grant_type\": \"client_credentials\",\n\t\"client_id\": \"' + this.apiKey + '\",\n\t\"client_secret\":\"' + this.secret + '\"\n}'    
      }).done(function(response) {
        self.token = response.access_token;
        return;
      }).fail(function(error){
        self.lastError = error;
        self.errorHandler();
      });
  }

  /*
   * Função para obter um animal pelo seu nome
   * 
   */
  async fetchAllPets() {
    // Safe Feature to see if the token is really assigned
    console.log(self.token);

    if (!self.token) {
      await this.updateAccessToken();
    }
    try {
      const response = await new Promise((resolve, reject) => {
        $.ajax({
          url: `${API_URL}/animals`,
          method: "GET",
          crossDomain: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + self.token
          },
          success: function (data) {
            resolve(data);
          },
          error: function (error) {
            reject(error);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      self.lastError = error;
      self.errorHandler();
    }
  }

async fetchPetById(id){

}

  /*
   * Função para manipular os erros retornados pela API, esses erros estão definidos na constante EROOR_CODES
   *
   */

  errorHandle(){
    if(!self.lastError) return;

    switch(self.lastError.status){
      case INVALID_CREDENTIALS: updateAccessToken(); break;
      case INSUFFICIENT_PERMISSIONS: console.log("INSUFFICIENT_PERMISSIONS"); break;
    
      default: console.log(self.lastError); break;
    }
    
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

/*
 * Codigo JavaScript para cada pagina
 * O MainFile esta a controlar o que acontece na pagina index.html
 */

// Main File --> Index.html
document.addEventListener('DOMContentLoaded', () => {
      
      const appState = new AppState();
      const petInterface = new PetInterface();
      
      const pets = petInterface.fetchAllPets();

      pets.then((pets) => {
        console.log(pets);
      });

//      placeDogs(pets, petInterface, appState);
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

