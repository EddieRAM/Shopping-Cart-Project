const API_URL = 'https://api.mercadolibre.com/sites/MLB/search?q=$computador';

// função que mantém o carrinho armazenado no local storage
function cartToLocalStorage() {
  const cart = document.getElementsByClassName('cart__items')[0]; // pegando o índice 0 da ol .cart__items
  localStorage.setItem('Suas Compras', cart.innerHTML); // e atribuindo um novo par key/value
}

// preciso somar todos os preços dos itens do carrinho
const updatePrices = () => {
  const allItems = document.querySelectorAll('.cart__item'); // para isso, pego dos ítens do carrinho
  // crio um array dos ítens do carrinho e retorno qualquer ocorrência que sejam apenas números, ainda que separados por um caracter não numeral
  const allPrices = [...allItems].map((item) => item.innerText.match(/[0-9.0-9]+$/)); // regex criado com o auxílio do https://regex101.com/
  const totalPrices = document.getElementsByClassName('total-price'); // recupero o ítem que irá exibir o total de preços na página
  totalPrices[0].innerText = allPrices.reduce((acc, curr) => acc + parseFloat(curr), 0);
  // e edito seu innerText para receber a soma dos resultados do RegEx limitando-se a 2 caracteres após o ponto.
};  

// ao ser chamada, essa função, adicionada previamente ao event listener e invocada por clique
function cartItemClickListener(event) { // cria um evento
  event.target.remove(); // que remove o alvo do clique
  updatePrices(); // adiciona a soma de preços
  cartToLocalStorage(); // e armazena no local storage as modificações feitas
}

// função que exibe os ítens do carrinho com os parâmetros sku, name e salePrice 
function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li'); // cria o item da lista
  li.className = 'cart__item'; // dá a classe 'cart__item' a cada item criado
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`; // nomes de exibição aos parâmetros
  li.addEventListener('click', cartItemClickListener); // e adiciona o item da lista ao event listener
  return li; // quando a função for chamada é isso que eu recebo
}

// preciso clicar no botão de cada item do objeto e receber suas informações conforme a func. cCIE. 
const addItemToCart = async ({ sku }) => { // para isso, crio uma Promisse que vai trabalhar com o sku dos ítens
  try { // se der, ela vai tentar
    await fetch(`https://api.mercadolibre.com/items/${sku}`) // esperar receber as informações de um item buscando pelo seu id
    .then((response) => response.json()) // transformar as informações recebidas em objeto javascript
    .then((info) => { // chamar as informações de info
      const cartOl = document.querySelector('.cart__items'); // recuperar a ol .cart__items no HTML por meio de uma constante
      const cartItem = createCartItemElement({ // recuperar a função que exibe os ítens do carrinho
        sku: info.id, // atribuir os nomes dos parâmetros às informações recebidas pelo objeto
        name: info.title,
        salePrice: info.price,
      });
      cartOl.appendChild(cartItem); // e colocar os ítens dentro da ol
      updatePrices(); // depois, chamar a função de soma de preços, que já será feita de forma assíncrona
    });
    cartToLocalStorage();
  } catch (error) { // caso falhe,
    alert(error.msg); // vai exibir um alerta
  }
};

// função que exibe a imagem do produto
function createProductImageElement(imageSource) {
  const img = document.createElement('img'); // criando elementos HTML img
  img.className = 'item__image'; // atribuíndo a classe 'item__image'
  img.src = imageSource; // e um nome passado como parâmetro
  return img; // quando chamada, a função exibirá a imagem
}
// essa função cria os elementos que serão tratados pela função cPIE
function createCustomElement(element, className, innerText) { // possibilitando terem uma classe e um innerText
  const e = document.createElement(element); // por meio de uma função que gera o elemento
  e.className = className; // dá uma propriedade className
  e.innerText = innerText; // e um innerText
  return e; // quando a função for chamada é isso que eu recebo
}
// quero só o sku, o título e a imagem dos anúncios retornados pelo objeto JSON e para isso...
function createProductItemElement({ sku, name, image }) { // passo o que quero como parâmetro à uma função 
  const section = document.createElement('section'); // que cria um elemento HTML section
  section.className = 'item'; // e atribui a classe .item
  // seus filhos receberão textos em linha para o id e o título, uma classe e um parâmetro
  section.appendChild(createCustomElement('span', 'item__sku', sku)); // filho id
  section.appendChild(createCustomElement('span', 'item__title', name)); // filho título
  section.appendChild(createProductImageElement(image)); // imagem criada através da função cPIE
  // variável sem parâmetro que cria um botão de classe 'item__add' e um texto 'Adicionar o carrinho' 
  const addToCartbtn = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'); 
  addToCartbtn.addEventListener('click', () => { // adicionado ao event listener 
    addItemToCart({ sku }); // e que leva a id do produto para o carrinho
  });
  section.appendChild(addToCartbtn); // o botão é adicionado como filho da section
  return section; // quando a função for chamada é isso que eu recebo
}
/* 
function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
} */

// função para remover o loading adicionado no HTML
const cleanLoading = () => {
  const eraseLoading = document.querySelector('.loading'); // pega tudo o que tiver a classe loading
  eraseLoading.remove(); // e remove  
};

// função para criar o botão de limpar o carrinho
const cleanCart = () => {
  const allItems = document.querySelectorAll('.cart__item'); // recupera todos os .cart__item  através da variável
  allItems.forEach((cartI) => cartI.remove()); // chama-os de cartI e remove-os
  cartToLocalStorage(); // adiciona as modificações no local storage
  updatePrices(); // isso faz com que o valor total seja zero após a limpeza
};

const fetchApi = async () => { // Prometo receber os dados da API sem parar o fluxo de execução dos demais códigos e digo  
  await fetch(API_URL) // espere o retorno da API
  .then((response) => response.json()) // entregue a resposta da API em formato JSON
    .then((object) => { // trate o objeto 
      object.results.forEach((product) => { // dentro do array results chame cada objeto imediato de product
        const addNewProduct = createProductItemElement({ // recupere a função cPIE através do objeto.
          sku: product.id, // atribua os nomes dos parâmetros da func. cPIE às chaves correspondentes do objeto
          name: product.title,
          image: product.thumbnail,
        });
        const addItemClass = document.querySelector('.items'); // armazene a classe 'items'
        addItemClass.appendChild(addNewProduct); // e atribua-na aos elementos do objeto
        const storage = localStorage.getItem('Suas Compras'); // agora recupere e guarde o item que tiver 'Suas Compras'
        document.getElementsByClassName('cart__items')[0].innerHTML = storage; // e diga que ele o primeiro item da ol é ele       
      });
    })
    .then(document.getElementsByClassName('empty-cart')[0].addEventListener('click', cleanCart)); // depois, adiciona o botão que limpa o carrinho ao event listener 
    cleanLoading(); // e chama a função que remove o loading    
};

window.onload = function onload() { // chame a Promise "fetchAPI ao carregar a página
  fetchApi();  
};