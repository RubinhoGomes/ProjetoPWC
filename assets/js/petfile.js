/*
 * APIKEY: SR3KY4fbCJuXOtsW5ACC4DLiol4elp3Gq86OL3rsc5CdEVnf1k
 * SECRET: 3p8Cq1XhNYyYDTgKXTf1k2XALJ4QbDpxRdIAbzr7
 * 
 * Made by : Rúben Gomes 2220859 AND Pedro Agostinho 222XXXX AND Bruna Indio 22XXXXX
 * Intelligence navigates, imagination discovers
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

/* const ERROR_CODES = {
  OK: 200,
  INVALID_CREDENTIALS: 401,
  INSUFFICIENT_PERMISSIONS: 403,
  NOT_FOUND: 404,
  UNPEXCETED_ERROR: 500,
  MISSING_PARAMETERS: 00001,
  INVALID_PARAMETERS: 00002
}; */

/*
 * Max Tries é utilizado para o numero de tentivas que a aplicação faz para obter um animal
 * Token URL é o url para obter o token de acesso a API
 * API_URL é o url para obter os animais (não estamos a usar este url porque estamos a usar o url completo no fetch)
 */
const MAX_TRIES = 3;
const LIMIT_CARD = 6;
const TOKEN_URL = 'https://api.petfinder.com/v2/oauth2/token/';
const API_URL = 'https://api.petfinder.com/v2';

/*
 * Esta constante é utilizada para traduzir a idade do animal
 * O valor da idade retornada pela API esta em ingles e esta constante é utilizada para traduzir para portugues
 */
const ANIMALS_AGE = {
  'Baby': 'Bébé', 
  'Young': 'Jovem', 
  'Adult': 'Adulto', 
  'Senior': 'Sénior'
};

/*
 * Class AppState
 * Esta classe instancia um Singleton (Explicada abaixo)
 * Esta classe é responsavel por guardar o estado da aplicação
 */
class AppState {
  constructor() {

    // Singleton : Basicamente o codigo abaixo vai assegurar que so existe uma instancia desta classe
    // Isto é importante porque so queremos que exista uma instancia do estado da aplicação 
    if(AppState.instance){
      return AppState.instance;
    }
    // Se não existir nenhuma instancia vai ser criada uma
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
  addFavorites(petId){
    if(this.state.favoritePets.includes(petId)) return; 
    this.state.favoritePets.push(petId);
  }

  /*
   * Function to remove favorites
   * @param {string} petName
   */
  removeFavorites(petId) {
    this.state.favoritePets = this.state.favoritePets.filter(pet => pet !== petId);
  }

  /*
   * Function to clear favorites
   */
  clearFavorites() {
    this.state.favorites = [];
  }

  /*
   * Function to set current search
   * @param {string} petName
   */
  setSearch(petName) {
    this.state.currentSearch = petName;
  }


  /*
   * Function to set currrent details 
   * @param {Int} animalId
   */
  setDetails(animalId) {
    this.state.currentDetails = animalId;
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
      // this.errorHandler();
    });
  }

  /*
   * Função para obter um animal pelo seu nome
   * 
   */
  async fetchAllPets() {
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

      return response.animals;
    } catch (error) {
      self.lastError = error;
      // this.errorHandler();
    }
  }

  async fetchPetById(id){
    if (!self.token) {
      await this.updateAccessToken();
    }

    try {
      const response = await new Promise((resolve, reject) => {
        $.ajax({
          url: `${API_URL}/animals/${id}`,
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
      return response.animal;
    } catch (error) {
      self.lastError = error;
      // this.errorHandler();
    }
  }

  /*
   * Função para manipular os erros retornados pela API, esses erros estão definidos na constante EROOR_CODES
   *
   */

  /* static errorHandler(){
    if(!self.lastError) return;

    switch(self.lastError.status){
      case ERROR_CODES.INVALID_CREDENTIALS: updateAccessToken(); break;
      case ERROR_CODES.INSUFFICIENT_PERMISSIONS: console.log("INSUFFICIENT_PERMISSIONS"); break;

      default: console.log(self.lastError); break;
    }
    return;
  } */

  /*
   * Devido aos nomes dos animais conterem caracteres especiais, é necessario filtrar esses caracteres 
   * para que o nome do animal seja exibido corretamente
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
    return ANIMALS_AGE[data.age];
  }

  static getPetGender(data){
    return data.gender;
  }

  static getPetBreed(data){
    return data.breeds.primary;
  }

  static getPetSpecies(data){
    return data.species;
  }

  static getPetColors(data){
    return data.colors.primary;
  }

  static getPetPhoto(data, size = 'full'){
    if(!data.photos[0]) return '../assets/img/sem-foto.png';
    
    if(size === 'large') return data.photos[0].large;
    if(size === 'medium') return data.photos[0].medium;
    if(size === 'full') return data.photos[0].full;
    if(size === 'small') return data.photos[0].small;
  }

} // end of class PetInterface


/*
 * Função para obter o link da pagina atual
 * Esta função foi feita para saber em que pagina o utilizador esta, para executar o codigo JavaScript respetivo
 */
const getPageLink = () => {
  const link = window.location.href;
  if(link.search(/[#]/) >= 0) return link.substring(link.lastIndexOf('/') + 1, link.length - 1);
  
  console.log(link);
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
  const animais = petInterface.fetchAllPets();
  
  // Verificar em que pagina o utilizador esta para puder executar o codigo respetivo
  if(getPageLink() ==='adoptpage.html') colocarPets(animais, petInterface, appState);
  if(getPageLink() === 'dogdetails.html') mostrarDetalhes(petInterface, appState);
  if(getPageLink() === 'favorites.html') mostrarFavoritos(petInterface, appState);

});


/*
 * Função para colocar os animais na pagina de mostrar animais
 * Esta função recebe os animais, a interface e o estado da aplicação como argumentos
 * 
 */

const colocarPets = (animais, petInterface, appState) => {

  const template = document.querySelector('#pet-template');
  // Ir buscar os containers para colocar os cards dos animais
  // Sendo dividido em dois containers com 3 animais cada
  const petContainerOne = document.querySelector('#petContainer-one');
  const petContainerSecond = document.querySelector('#petContainer-second');
  let index = 0;
  
  animais.then((animal) => {
    animal.forEach((animal) => {
      if(index < LIMIT_CARD) {
        console.log(PetInterface.getPetId(animal));
        const petsCardTemplate = template.content.cloneNode(template.content, true);

        console.log(getPageLink());
        const petCardImage = petsCardTemplate.getElementById('petCard');
        const petCardBody = petsCardTemplate.getElementById('petBody');
        // Buscar o primeiro elemente do PetCard Image
        const petImage = petCardImage.children[0];
        //Buscar os elementos do PetCard Body para colocar os dados dos animais
        const petName = petCardBody.children[0];
        const petDesc = petCardBody.children[1];
        const petButtonDetails = petCardBody.children[2];
        const petButtonFavorite = petCardBody.children[3];

        petImage.src = PetInterface.getPetPhoto(animal);
        petName.innerHTML = "Name: " + PetInterface.getPetName(animal);
        petDesc.innerHTML = "Idade: " + PetInterface.getPetAge(animal);

        if(index < 3) {
          petContainerOne.appendChild(petsCardTemplate);
        }
        else {
          petContainerSecond.appendChild(petsCardTemplate);
        }

        //
        petButtonFavorite.id = 'btnFavorite-' + PetInterface.getPetId(animal);
        petButtonDetails.id = 'btnDetails-' + PetInterface.getPetId(animal);

        //
        setEventListeners(PetInterface.getPetId(animal), PetInterface, appState);

        index++;
      }
    });
  });
};



/*
 * Função que adiciona os eventos de click nos botões de favoritar e detalhes
 */
const setEventListeners = (animalID, petInterface, appState) => {

  const btnFavorite = document.querySelector('#btnFavorite-' + animalID);
  const btnDetails = document.querySelector('#btnDetails-' + animalID);


  btnDetails.addEventListener('click', () => {
    appState.setDetails(animalID);
    appState.saveState();
    window.location.assign("dogdetails.html");
  });

  btnFavorite.addEventListener('click', () => {

    const favoritos = appState.getFavorites();

    if(favoritos.includes(animalID)){
      btnFavorite.innerHTML = '🤍';
      appState.removeFavorites(animalID);
    } else {
      btnFavorite.innerHTML = '❤️';
      appState.addFavorites(animalID);
    }

    appState.saveState();

  });

};

/*
 * Função que mostra os detalhes do animal selecionado
 * @param {PetInterface} petInterface - Interface de acesso aos dados dos animais
 * @param {AppState} appState - Estado da aplicação
 * @returns {void}
 */
const mostrarDetalhes = (petInterface, appState) => {
  
  const petId = appState.state.currentDetails;
  const animal = petInterface.fetchPetById(petId);
  const template = document.querySelector("#template-card");
  const container = document.querySelector("#containerInfoPet");

  animal.then((animal) => {
    const petsCardTemplate = template.content.cloneNode(template, true); 
 
    const cardImg = petsCardTemplate.getElementById('details-img');
    const detalhes = petsCardTemplate.getElementById('details-pet');
    const buttoes = petsCardTemplate.getElementById('details-button');

    const nomeAnimal = detalhes.children[0];
    const racaAnimal = detalhes.children[1];
    const descAnimal = detalhes.children[2];

    const image = cardImg.children[0];

    image.src = PetInterface.getPetPhoto(animal);
    nomeAnimal.innerHTML = PetInterface.getPetName(animal) + ' - ' + PetInterface.getPetAge(animal);
    racaAnimal.innerHTML = PetInterface.getPetBreed(animal);
    descAnimal.innerHTML = PetInterface.getPetSpecies(animal);

 

    container.appendChild(petsCardTemplate);

    // Adicionar os listeners dos botões
    setDetailsListeners(animal, petInterface, appState);


  });
};

// Função para adicionar os listeners dos botões para os detalhes, pensamos em utilizar a função anterior
// mas teriamos que criar validações para cada botão, então optamos por criar uma função separada
// Tornando o codigo mais facil de compreender e uma leitura mais simples
const setDetailsListeners = (animal, petInterface, appState) => {
  
  const buttons = document.querySelector('#details-button');

  const btnAdotar = buttons.children[0];
  const btnVoltar = buttons.children[1];
  const btnFavorito = buttons.children[2];

  // Adicionar o listener para o botão dos favoritos
  // Codigo bastanten identico ao favoritos do adoptpage
  btnFavorite.addEventListener('click', () => {

    const favoritos = appState.getFavorites();

    if(favoritos.includes(PetInterface.getPetId(animal))){
      btnFavorito.innerHTML = '🤍';
      appState.removeFavorites(PetInterface.getPetId(animal));
    } else {
      btnFavorito.innerHTML = '❤️';
      appState.addFavorites(PetInterface.getPetId(animal));
    }

    appState.saveState();

  });

  // Adicionar o listener para o botão btnVoltar
  // Utilizamos o window.location.assign para redirecionar o utilizador para a página anterior
  btnVoltar.addEventListener('click', () => {
    window.location.assign("adoptpage.html");
  });
  
  // Adicionar o listener para o botão btnAdotar
  // Utilizamos o window.location.assign para redirecionar o utilizador para a página anterior
  // E utilizamos o alert para mostrar uma mensagem para o utilizador
  btnAdotar.addEventListener('click', () => {
    window.location.assign("adoptpage.html");
    alert('Parabéns! Você adotou um pet!');
  });

};

/*
 *
 *
 *
 */
const mostrarFavoritos = (petInterface, appState) => {
  
  const template = document.querySelector('#favorite-card');
  const petContainerOne = document.querySelector('#petContainer-one');
  const petContainerSecond = document.querySelector('#petContainer-second');
  // Apenas usado em caso de existrem mais de 6 animais favoritos
  const petContainerThird = document.querySelector('#petContainer-third');
  // Apenas usado em caso de existrem mais de 9 animais favoritos
  const petContainerFourth = document.querySelector('#petContainer-fourth');
  let index = 0;
  
  const animais = appState.getFavorites();
  
  animais.forEach(animal => {
    petInterface.fetchPetById(animal).then(pet => {
    
      const petsCardTemplate = template.content.cloneNode(true);

      const img = petsCardTemplate.querySelector('#detalhes-img');
      const petCard = petsCardTemplate.querySelector('#detalhes-pet');
      
      img.src = PetInterface.getPetPhoto(pet);

      const petName = petCard.children[0];
      const petSpecie = petCard.children[1];


      petName.innerHTML = PetInterface.getPetName(pet) + ' - ' + PetInterface.getPetAge(pet);
      petSpecie.innerHTML = PetInterface.getPetSpecies(pet) + ' - ' + ((PetInterface.getPetColors(pet) == null) ? PetInterface.getPetGender(pet) : PetInterface.getPetColors(pet));

      const buttonCard = petsCardTemplate.querySelector('#button-favorites');
      const petButtonFavorite = buttonCard.children[0];
      const petButtonDetails = buttonCard.children[1];

      petButtonFavorite.id = 'btnFavorite-' + PetInterface.getPetId(pet);
      petButtonFavorite.innerHTML = '❤️';
      petButtonDetails.id = 'btnDetails-' + PetInterface.getPetId(pet);


      if (index < 3) petContainerOne.appendChild(petsCardTemplate);
      else if (index < 6) petContainerSecond.appendChild(petsCardTemplate);
      else if (index < 9) petContainerThird.appendChild(petsCardTemplate);
      else if(index < 12) petContainerFourth.appendChild(petsCardTemplate);

      index++;

      setFavoritesListeners(PetInterface.getPetId(pet), appState, petInterface);

     });
    });

    

};

const setFavoritesListeners = (petId, appState, petInterface) => {

  const favoriteButton = document.querySelector('#btnFavorite-' + petId);
  const detalhesButton = document.querySelector('#btnDetails-' + petId);

  favoriteButton.addEventListener('click', () => {

    const favoritos = appState.getFavorites();
 
    if(favoritos.includes(petId)){
      favoriteButton.innerHTML = '🤍';
      appState.removeFavorites(petId);
    } else {
      favoriteButton.innerHTML = '❤️';
      appState.addFavorites(petId);
    }

    appState.saveState();
  });

  detalhesButton.addEventListener('click', () => {
    appState.setDetails(petId);
    appState.saveState();
    window.location.assign("dogdetails.html");
  });

}

// End of Main File --> Index.html
