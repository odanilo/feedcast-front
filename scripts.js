const API_URL = 'http://127.0.0.1:5000';

/*
  --------------------------------------------------------------------------------------
  Elementos que serão manipulados durante a aplicação
  --------------------------------------------------------------------------------------
*/
const $body = document.querySelector('body');
const $dialogRoot = document.getElementById('dialog-root');

const $buttonAdicionarEpisodio = document.querySelector(
  '[data-js="btn-adicionar-episodio"]'
);
const $formAdicionarEpisodio = document.querySelector(
  '[data-js="form-adicionar-episodio"]'
);

const $listEpisodiosContainer = document.querySelector(
  '[data-js="list-episodios"]'
);

/*
  --------------------------------------------------------------------------------------
  Funções para listar episódios
  --------------------------------------------------------------------------------------
*/
const gerarCardEpisodioMarkup = ({ id, audio, capa, descricao, titulo }) => `
  <li class="episodios__item" data-episodio-id="${id}">
    <main class="episodios-item__main">
      <figure class="episodios-item__cover cover">
        <img
          src="${capa}"
          alt="Capa do episódio '${titulo}'"
        />
      </figure>

      <article class="episodios-item__info">
        <header class="episodios-item__header">
          <h3>
            ${titulo}
          </h3>

          <div class="episodios-item__actions">
            <button class="cta cta--edit cta--only-icon">
              <span class="cta-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="size-6"
                >
                  <path
                    d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                  />
                </svg>
              </span>
            </button>
            <button class="cta cta--delete cta--only-icon" data-js="delete-episodio-btn" data-episodio-id="${id}">
              <span class="cta-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="size-6"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </button>
          </div>
        </header>

        <div class="episodios-item__description">
          ${descricao}
        </div>
      </article>
    </main>

    <footer class="episodios-item__footer">
      <figure class="episodios-item__audio-info">
        <figcaption class="episodios-item__caption">
          Escute o episódio
          <a
            href="${audio}"
            >ou baixe o arquivo
          </a>
        </figcaption>
        <audio
          class="episodios-item__player"
          controls
          src="${audio}"
        ></audio>
      </figure>
    </footer>
  </li>
`;

const listEpisodios = (episodios) => {
  const markup = episodios
    .map((episodio) => gerarCardEpisodioMarkup(episodio))
    .join('');

  $listEpisodiosContainer.innerHTML = markup;
};

const getListEpisodios = async () => {
  const endpoint = `${API_URL}/episodios`;

  try {
    const result = await fetch(endpoint);

    if (!result.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const response = await result.json();
    listEpisodios(response.episodios);

    return response.episodios;
  } catch (error) {
    console.error(error.message);
  }
};

getListEpisodios();

/*
  --------------------------------------------------------------------------------------
  Funções para deletar episódios
  --------------------------------------------------------------------------------------
*/
const deleteEpisodio = async (episodioId) => {
  const endpoint = `${API_URL}/episodios/${episodioId}`;

  try {
    const result = await fetch(endpoint, { method: 'delete' });

    if (!result.ok) {
      throw new Error(`Erro ao tentar deletar episódio: ${response.status}`);
    }

    await getListEpisodios();
  } catch (error) {
    console.error(error.message);
  }
};

const handleDeleteEpisodioClick = (e) => {
  console.log(e.target);
};

/*
  --------------------------------------------------------------------------------------
  Função para manipular o dialog/modal
  --------------------------------------------------------------------------------------
*/
const closeDialog = () => {
  $body.classList.remove('body--dialog-open');
};

const openDialog = () => {
  $body.classList.add('body--dialog-open');
};

const handleDialogClickEvents = (e) => {
  const elemento = e.target;

  if (
    elemento.dataset.js === 'dialog-root' ||
    elemento.dataset.js === 'close-dialog-btn' ||
    elemento.dataset.js === 'cancel-dialog-btn'
  ) {
    closeDialog();
  }
};

/*
  --------------------------------------------------------------------------------------
  Funções para adicionar um novo episódio
  --------------------------------------------------------------------------------------
*/
const postEpisodio = async (formData) => {
  const endpoint = `${API_URL}/episodios`;

  try {
    const result = await fetch(endpoint, { method: 'post', body: formData });

    if (!result.ok) {
      throw new Error(
        `Erro inesperado ao tentar adicionar episódio: ${response.status}`
      );
    }

    await getListEpisodios();
  } catch (error) {
    console.error(error.message);
  }
};

const handleAdicionarEpisodioSubmitForm = async (e) => {
  const formData = new FormData(e.target);

  await postEpisodio(formData);
  closeDialog();
};

/*
  --------------------------------------------------------------------------------------
  Adicionando listeners a elemento com funções que foram criadas acima
  --------------------------------------------------------------------------------------
*/
$dialogRoot.addEventListener('click', handleDialogClickEvents);

$buttonAdicionarEpisodio.addEventListener('click', () => {
  $formAdicionarEpisodio.reset();
  openDialog();
});

$formAdicionarEpisodio.addEventListener(
  'submit',
  handleAdicionarEpisodioSubmitForm
);

$listEpisodiosContainer.addEventListener('click', async (e) => {
  console.log(e.target);

  if (e.target.dataset.js === 'delete-episodio-btn') {
    const episodioId = Number(e.target.dataset.episodioId);

    if (episodioId && typeof episodioId === 'number') {
      await deleteEpisodio(episodioId);
      console.log('deletou');
    }
  }
});
/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {};

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList();

/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputProduct, inputQuantity, inputPrice) => {
  const formData = new FormData();
  formData.append('nome', inputProduct);
  formData.append('quantidade', inputQuantity);
  formData.append('valor', inputPrice);

  let url = 'http://127.0.0.1:5000/produto';
  fetch(url, {
    method: 'post',
    body: formData,
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
};

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement('span');
  let txt = document.createTextNode('\u00D7');
  span.className = 'close';
  span.appendChild(txt);
  parent.appendChild(span);
};

/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName('close');
  // var table = document.getElementById('myTable');
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const nomeItem = div.getElementsByTagName('td')[0].innerHTML;
      if (confirm('Você tem certeza?')) {
        div.remove();
        deleteItem(nomeItem);
        alert('Removido!');
      }
    };
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item) => {
  console.log(item);
  let url = 'http://127.0.0.1:5000/produto?nome=' + item;
  fetch(url, {
    method: 'delete',
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
};

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome, quantidade e valor
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputProduct = document.getElementById('newInput').value;
  let inputQuantity = document.getElementById('newQuantity').value;
  let inputPrice = document.getElementById('newPrice').value;

  if (inputProduct === '') {
    alert('Escreva o nome de um item!');
  } else if (isNaN(inputQuantity) || isNaN(inputPrice)) {
    alert('Quantidade e valor precisam ser números!');
  } else {
    insertList(inputProduct, inputQuantity, inputPrice);
    postItem(inputProduct, inputQuantity, inputPrice);
    alert('Item adicionado!');
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (nameProduct, quantity, price) => {
  var item = [nameProduct, quantity, price];
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButton(row.insertCell(-1));
  document.getElementById('newInput').value = '';
  document.getElementById('newQuantity').value = '';
  document.getElementById('newPrice').value = '';

  removeElement();
};
