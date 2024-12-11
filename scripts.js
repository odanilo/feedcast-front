/*
  --------------------------------------------------------------------------------------
  Função para facilitar e padronizar requisições para api
  --------------------------------------------------------------------------------------
*/
const API_URL = 'http://127.0.0.1:5000';

const httpClient = async (endpoint, { body, ...customConfig } = {}) => {
  const config = {
    method: body ? 'POST' : 'GET',
    body,
    ...customConfig,
  };

  const response = await fetch(`${API_URL}/${endpoint}`, config);

  if (!response.ok) {
    const errorMessage = await response.text();

    return Promise.reject(new Error(errorMessage));
  }

  return await response.json();
};

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

const $formAtualizarEpisodio = document.querySelector(
  '[data-js="form-atualizar-episodio"]'
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
          loading="lazy"
        />
      </figure>

      <article class="episodios-item__info">
        <header class="episodios-item__header">
          <h3>
            ${titulo}
          </h3>

          <div class="episodios-item__actions">
            <button class="cta cta--edit cta--only-icon" data-js="atualizar-episodio-btn" data-episodio-id="${id}">
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
            preload="meta"
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

const inserirEpisodiosNaView = (episodios) => {
  const markup = episodios
    .map((episodio) => gerarCardEpisodioMarkup(episodio))
    .join('');

  $listEpisodiosContainer.innerHTML = markup;
};

const getListEpisodios = async () => {
  try {
    const { episodios } = await httpClient('episodios');
    return episodios;
  } catch (error) {
    console.error(error.message);
  }
};

const atualizarEpisodios = () => {
  getListEpisodios().then((episodios) => inserirEpisodiosNaView(episodios));
};

atualizarEpisodios();

/*
  --------------------------------------------------------------------------------------
  Funções para deletar episódios
  --------------------------------------------------------------------------------------
*/
const deleteEpisodio = async (episodioId) => {
  try {
    return await httpClient(`episodios/${episodioId}`, {
      method: 'DELETE',
    });
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

const openDialog = (dialogName) => {
  const dialogs = {
    NOVO_EPISODIO: 'dialog-adicionar-episodio',
    ATUALIZAR_EPISODIO: 'dialog-atualizar-episodio',
  };

  const dialogToShow = document.querySelector(
    `[data-js="${dialogs[dialogName]}"]`
  );

  if (!dialogToShow) {
    throw new Error(`Nenhum dialog com nome ${dialogName}`);
  }

  $body.classList.add('body--dialog-open');

  for (const dialog in dialogs) {
    const dialogToHide = document.querySelector(
      `[data-js="${dialogs[dialog]}"]`
    );

    if (!dialogToHide) {
      throw new Error(`Nenhum dialog com nome ${dialogs[dialog]}`);
    }

    dialogToHide.classList.remove('dialog--is-open');
  }

  dialogToShow.classList.add('dialog--is-open');
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
  try {
    return await httpClient('/episodios', { body: formData });
  } catch (error) {
    console.error(error.message);
  }
};

const handleAdicionarEpisodioSubmitForm = async (e) => {
  const formData = new FormData(e.target);

  await postEpisodio(formData);
  atualizarEpisodios();
  closeDialog();
};

/*
  --------------------------------------------------------------------------------------
  Funções para buscar um episódio
  --------------------------------------------------------------------------------------
*/
const getEpisodio = async (episodioId) => {
  try {
    return await httpClient(`episodios/${episodioId}`);
  } catch (error) {
    console.error(error.message);
  }
};

/*
  --------------------------------------------------------------------------------------
  Funções para editar um episódio
  --------------------------------------------------------------------------------------
*/
const editEpisodio = async (formData) => {
  const episodioId = formData.get('id_episodio');

  if (!episodioId) {
    throw new Error('Não é possível atualizar um episódio sem um ID');
  }

  try {
    return await httpClient(`episodios/${episodioId}`, {
      method: 'PUT',
      body: formData,
    });
  } catch (error) {
    console.error(error.message);
  }
};

const atualizarFormFields = async (episodioId) => {
  const episodio = await getEpisodio(episodioId);

  if (!episodio) {
    throw new Error(
      `Episódio com id ${episodioId} não encontrado para atualizar`
    );
  }

  const fields = [
    { name: 'audio', value: episodio.audio },
    { name: 'capa', value: episodio.capa },
    { name: 'descricao', value: episodio.descricao },
    { name: 'titulo', value: episodio.titulo },
    { name: 'id_episodio', value: episodio.id },
  ];

  fields.forEach((field) => {
    const input = $formAtualizarEpisodio.querySelector(
      `[name="${field.name}"]`
    );

    if (!input) {
      throw new Error(
        `Não foi possível encontrar um campo com o name ${field.name}`
      );
    }

    input.value = field.value;
  });
};

const handleAtualizarEpisodioSubmitForm = async (e) => {
  const formData = new FormData(e.target);

  await editEpisodio(formData);
  atualizarEpisodios();
  closeDialog();
};

/*
  --------------------------------------------------------------------------------------
  Adicionando listeners a elementos com funções que foram criadas acima
  --------------------------------------------------------------------------------------
*/
$dialogRoot.addEventListener('click', handleDialogClickEvents);

$buttonAdicionarEpisodio.addEventListener('click', () => {
  $formAdicionarEpisodio.reset();
  openDialog('NOVO_EPISODIO');
});

$formAdicionarEpisodio.addEventListener(
  'submit',
  handleAdicionarEpisodioSubmitForm
);

$listEpisodiosContainer.addEventListener('click', async (e) => {
  if (e.target.dataset.js === 'delete-episodio-btn') {
    const episodioId = Number(e.target.dataset.episodioId);

    if (episodioId && typeof episodioId === 'number') {
      await deleteEpisodio(episodioId);
      atualizarEpisodios();
    }
  }

  if (e.target.dataset.js === 'atualizar-episodio-btn') {
    const episodioId = Number(e.target.dataset.episodioId);

    if (episodioId && typeof episodioId === 'number') {
      $formAtualizarEpisodio.reset();
      openDialog('ATUALIZAR_EPISODIO');
      await atualizarFormFields(episodioId);
    }
  }
});

$formAtualizarEpisodio.addEventListener(
  'submit',
  handleAtualizarEpisodioSubmitForm
);
