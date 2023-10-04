var apiKey = '3f301be7381a03ad8d352314dcc3ec1d';
let requestToken:string;
let username:string;
let password:string;
let sessionId:string;
let listId = ['8272943', '8273006'];
let mainListId = '8272943';
let currentPage:number = 1;

let loginButton = (document.getElementById('login-button') as HTMLButtonElement);
let searchButton = (document.getElementById('search-button') as HTMLButtonElement);
let createElement = (document.getElementById('createElement') as HTMLButtonElement);
let searchContainer = (document.getElementById('search-container') as HTMLDivElement);
//let ListsDiv = (document.getElementById('ListsDiv') as HTMLDivElement);
let ListsDiv = (document.getElementById('ListsDiv') as HTMLDivElement);
let loadMoreItems = (document.getElementById('loadMoreItems') as HTMLButtonElement);
let createList = (document.getElementById('createList') as HTMLButtonElement);
let loginDiv = (document.getElementById('loginDiv') as HTMLElement);

let showList = (document.getElementById('showList') as HTMLButtonElement);

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})

function preencherSenha() {
  password = (document.getElementById('senha') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherLogin() {
  username =  (document.getElementById('login') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherApi() {
  apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

type UMB = {
    url:string;
    method:string;
    body?:any
}

class HttpClient {
  static async get({url, method, body}:UMB) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // request.setRequestHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
        // request.setRequestHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PUT");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function criarRequestToken () {
  let result:any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })
  requestToken = result.request_token
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result:any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  sessionId = result.session_id;
  console.log(sessionId);
}

searchButton.addEventListener('click', async () => {
    let lista = (document.getElementById("lista") as HTMLDivElement);
    if (lista) {
        lista.outerHTML = "";
    }
    let query = (document.getElementById('search') as HTMLInputElement).value;
    let listaDeFilmes:any = await procurarFilme(query);
    let ul = document.createElement('ul');
    ul.id = "lista"
    for (const item of listaDeFilmes.results) {
        let li = document.createElement('li');
        li.innerHTML = `<span onclick=loadInfo(this.id) id="${item.id}">${item.title}</span>`
        ul.appendChild(li)
        //console.log(item.title)
    }
    console.log(listaDeFilmes);
    searchContainer.appendChild(ul);
})

async function adicionarFilmeNaLista(filmeId:string, listaId:string) {
    let result = await HttpClient.get({
      url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
      method: "POST",
      body: {
        media_id: filmeId
      }
    })
    console.log(result);
}

async function removerFilmeNaLista(filmeId:string, listaId:string) {
    let result = await HttpClient.get({
      url: `https://api.themoviedb.org/3/list/${listaId}/remove_item?api_key=${apiKey}&session_id=${sessionId}`,
      method: "POST",
      body: {
        media_id: filmeId
      }
    })
    console.log(result);
}

function loadInfo(id:string){
    const sectionInfo = document.getElementById('sectionInfo') as HTMLElement;
    const newHtml = `
    <div>
        <h1 class="mediaTitle"></h1>
        <span class="mediaId">${id}</span>
    </div>
    <div>
        <p class="mediaOverview"></p>
        <span class="mediaPopularity"></span>
    </div>
    <button type="button" onclick="adicionarFilmeNaLista(${id}, ${mainListId})">Adicionar a sua lista principal</button>
    `;
    sectionInfo.innerHTML = newHtml;
}

loadMoreItems.addEventListener('click', async () => {
    let lista = document.getElementById("lista");
    // if (lista) {
    //     lista.outerHTML = "";
    // }
    let query = (document.getElementById('search') as HTMLInputElement).value;
    let listaDeFilmes:any = await procurarFilmeMoreItems(query);

    for (const item of listaDeFilmes.results) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(item.original_title))
        if(lista){
            lista.appendChild(li)
        }
    }
    console.log(listaDeFilmes);
    //searchContainer.appendChild(lista);
})

async function listDetail() {
    let result = await HttpClient.get({
      url: `https://api.themoviedb.org/3/list/8272943?api_key=402bcc5dda6b222414ecd13fd4e038d2`,
      method: "GET"
    })
    //console.log(result)
    return result
}

//https://api.themoviedb.org/3/list/8272943?language=en-US
//https://api.themoviedb.org/3/list/8272943?api_key=402bcc5dda6b222414ecd13fd4e038d2
    let teste = '';
    listDetail();

async function showMainList() {
    let teste = '';
    let mainList:any = document.getElementById('mainList') as HTMLDivElement;
    mainList.innerHTML = '';
    let myList:any = await listDetail();
    console.log(myList.items)

    for (const item of myList.items) {
        console.log(item.title)
        let newHtml = `
            <li>${item.title}</li>
        `;
        mainList.innerHTML += newHtml;
    }
}

async function procurarFilme(query:string) {
    query = encodeURI(query)
    let result = await HttpClient.get({
      url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
      method: "GET"
    })
    return result
}

async function procurarFilmeMoreItems(query:string) {
    currentPage += 1;
    query = encodeURI(query)
    let result = await HttpClient.get({
      url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${currentPage}`,
      method: "GET"
    })
    return result
}

createList.addEventListener("click", () => {
    let listName = (document.getElementById('listName') as HTMLInputElement).value;
    let listDescription = (document.getElementById('listDescription') as HTMLInputElement).value;
    if(listName){
        console.log(listName)
        criarLista(listName, listDescription);
    }
})

async function criarLista(nomeDaLista: string, descricao:string) {
    let result:any = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
        method: "POST",
        body: {
            name: nomeDaLista,
            description: descricao,
            language: "pt-br"
        }
    })
    listId.push(result.list_id);
}

showList.addEventListener('click', () => {
    pegarLista();
})

async function pegarLista() {
    let qtdList:number = listId.length;
    for(let i = 0; i <= qtdList; i++){
        let result:any = await HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listId[i]}?api_key=${apiKey}`,
            method: "GET"
        })
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(result.name))
        ListsDiv.appendChild(li);
    }
    //ListsDiv.appendChild(ul);
}

const loginFechar = document.getElementById('loginFechar') as HTMLButtonElement;

loginFechar.addEventListener("click", () =>{
    loginDiv.style.display = 'none'
})

// async function pegarLista() {
//     let qtdList:number = listId.length;
//     for(let i = 0; i <= qtdList; i++){
//         let result:any = await HttpClient.get({
//             url: `https://api.themoviedb.org/3/account/20521739/lists?page=1&session_id=${sessionId}`,
//             method: "OPTIONS"
//         })
//         let li = document.createElement('li');
//         li.appendChild(document.createTextNode(result.name))
//         ListsDiv.appendChild(li);
//     }
//     //ListsDiv.appendChild(ul);
// }

// createElement.addEventListener('click', () =>{

//     let ul = document.createElement('ul');
//     ul.id = "testeUl"
    
//     let li = document.createElement('li');
//     li.appendChild(document.createTextNode("teste"))
//     ul.appendChild(li)
//     ListsDiv.appendChild(li);
    
// })

{/* <div style="display: flex;">
  <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
  </div>
</div>*/}