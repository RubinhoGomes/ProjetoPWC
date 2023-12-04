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
const LIMIT_CARD = 6;
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
      return response.animals;
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

  static errorHandler(){
    if(!self.lastError) return;

    switch(self.lastError.status){
      case ERROR_CODES.INVALID_CREDENTIALS: updateAccessToken(); break;
      case ERROR_CODES.INSUFFICIENT_PERMISSIONS: console.log("INSUFFICIENT_PERMISSIONS"); break;

      default: console.log(self.lastError); break;
    }
  }

  /*
   * Devido aos nomes dos animais conterem caracteres especiais, é necessario filtrar esses caracteres 
   * para que o nome do animal seja exibido corretamente
   *
   */
  static filtrarNomeAnimal(textoOriginal) {
    const indiceCaracterEspecial = textoOriginal.search(/[^\w\s]/);

    if (indiceCaracterEspecial === -1) return textoOriginal;

    const indiceUltimoEspaco = textoOriginal.lastIndexOf(' ', indiceCaracterEspecial);
    const textoSemCaracteresEspeciais = textoOriginal.substring(0, indiceUltimoEspaco);

    return textoSemCaracteresEspeciais;
  }

   static getPetId(data){
    return data.id;
  }

  static getPetName(data){
    return this.filtrarNomeAnimal(data.name);
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

  static getPetPhoto(data, size = 'full'){
    if(!data.photos[0]) return;
    
    if(size === 'large') return data.photos[0].large;
    if(size === 'medium') return data.photos[0].medium;
    if(size === 'full') return data.photos[0].full;
    if(size === 'small') return data.photos[0].small;
  }



} // end of class PetInterface


/*
 *
 *
 */
const getPageLink = () => {
  const link = window.location.href;
  return link.substring(link.lastIndexOf('/') + 1);
};


/*
 * Codigo JavaScript para cada pagina
 * O MainFile esta a controlar o que acontece na pagina index.html
 */

// Main File --> Index.html
document.addEventListener('DOMContentLoaded', () => {

  const appState = new AppState();
  const petInterface = new PetInterface();

  // petInterface.fetchPetByName("Bella"); Descomentar para testar

  const animais = petInterface.fetchAllPets();
  const template = document.querySelector('#pet-template');
  let index = 0;
  // Criar um IF caso a pagina seja adoptpage.html executar o colocarPets();
  // if(getPageLink() === 'adoptpage.html') colocarPets(animais, petInterface, appState);

  animais.then((animal) => {
    animal.forEach((animal) => {
      if(index < LIMIT_CARD){
        console.log(PetInterface.getPetId(animal));
        const petsCardTemplate = template.content.cloneNode(template.content, true);
        /* TODO:
         * 1. Entender bem como o codigo deve funcionar
         * 2. Alterar o codigo que esta embaixo
         * 3. Testar se o codigo funciona
         */
        console.log(getPageLink());
        
        const petCard = petsCardTemplate.getElementById('petCard');
        
        const petImage = petCard.children[0];
        const petName = petCard.children[1];
        const petDesc = petCard.children[2];
        const petButtonDetails = petCard.children[3];
        const petButtonFavorite = petCard.children[4];
        
        petImage.src = PetInterface.getPetPhoto(animal);
        petName.innerHTML = "Name: " + PetInterface.getPetName(animal);
        petDesc.innerHTML = "Idade: " + PetInterface.getPetAge(animal);
        petButtonDetails.addEventListener('click', () => {
          appState.setPet(animal);
          window.location.href = "dogs.html";
        }); 
        petButtonFavorite.addEventListener('click', () => {
          appState.setPet(animal);
        });

        const petContainerOne = document.querySelector('#petContainer-one');
        const petContainerSecond = document.querySelector('#petContainer-second'); 

        if(index < 3){
          petContainerOne.appendChild(petsCardTemplate);
        }
        else {
          petContainerSecond.appendChild(petsCardTemplate);
        }

        index++;
      } 
    });
  });
});


const colocarPets = (animais, petInterface, appState) => {
  
  const template = document.querySelector('#pet-template');
  const petContainer = document.querySelector('#container-template');
  
};



// End of Main File --> Index.html
