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

const $buttonAdicionarPerfil = document.querySelector(
  '[data-js="btn-adicionar-perfil"]'
);
const $formAdicionarPerfil = document.querySelector(
  '[data-js="form-adicionar-perfil"]'
);

const $buttonImportarFeed = document.querySelector(
  '[data-js="btn-importar-feed"]'
);
const $formImportarFeed = document.querySelector(
  '[data-js="form-importar-feed"]'
);

/*
  --------------------------------------------------------------------------------------
  Função para manipular o dialog/modal
  --------------------------------------------------------------------------------------
*/
const closeDialog = () => {
  $body.classList.remove('body--dialog-open');
  document.removeEventListener('keydown', handleEscKeyOnModalOpen);
};

function handleEscKeyOnModalOpen(e) {
  if (e.key !== 'Escape') return;
  closeDialog();
}

const openDialog = (dialogName) => {
  const dialogs = {
    NOVO_EPISODIO: 'dialog-adicionar-episodio',
    ATUALIZAR_EPISODIO: 'dialog-atualizar-episodio',
    NOTIFICACAO: 'dialog-notification',
    NOVO_PERFIL: 'dialog-adicionar-perfil',
    IMPORTAR_FEED: 'dialog-importar-feed',
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

  document.addEventListener('keydown', handleEscKeyOnModalOpen);

  return dialogToShow;
};

const openNotification = ({ titulo, mensagem, tipo } = {}) => {
  const SUCCESS_CLASS = 'dialog--success';
  const ERROR_CLASS = 'dialog--error';

  const $dialog = openDialog('NOTIFICACAO');

  $dialog.classList.remove(ERROR_CLASS);
  $dialog.classList.remove(SUCCESS_CLASS);

  if (tipo == 'error') {
    $dialog.classList.add(ERROR_CLASS);
  }

  if (tipo == 'success') {
    $dialog.classList.add(SUCCESS_CLASS);
  }

  $dialog.querySelector('[data-js="dialog-header"]').textContent = titulo;
  $dialog.querySelector('[data-js="dialog-main"]').textContent = mensagem;
};

const handleDialogClickEvents = (e) => {
  const elemento = e.target;

  if (
    elemento.dataset.js === 'close-dialog-btn' ||
    elemento.dataset.js === 'cancel-dialog-btn'
  ) {
    closeDialog();
  }
};

/*
  --------------------------------------------------------------------------------------
  Funções para manipular views
  --------------------------------------------------------------------------------------
*/
const showView = (viewName) => {
  const views = {
    EMPTY: 'NO-PROFILE',
    CONTENT: 'LISTING',
  };

  const viewToShow = document.querySelector(
    `[data-view-id="${views[viewName]}"]`
  );

  if (!viewToShow) {
    throw new Error(`Nenhum view com nome ${viewName}`);
  }

  for (const view in views) {
    const viewToHide = document.querySelector(
      `[data-view-id="${views[view]}"]`
    );

    if (!viewToHide) {
      throw new Error(`Nenhuma view com nome ${views[view]}`);
    }

    viewToHide.classList.remove('view--is-visible');
  }

  viewToShow.classList.add('view--is-visible');

  return viewToShow;
};

showView('EMPTY');

/*
  --------------------------------------------------------------------------------------
  Funções para encontrar profile
  --------------------------------------------------------------------------------------
*/
const getProfile = async () => {
  try {
    return await httpClient(`profile`);
  } catch (error) {
    const errorMessage = JSON.parse(error.message)?.message || error.message;

    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de buscar o seu perfil. ${errorMessage}`,
      titulo: 'Falha ao buscar perfil',
    });

    console.error(errorMessage);
  }
};

const inserirProfileHtml = (profile) => {
  showView('CONTENT');

  const $title = document.querySelector('[data-js="profile-title"]');
  const $author = document.querySelector('[data-js="profile-author"]');
  const $description = document.querySelector(
    '[data-js="profile-description"]'
  );
  const $cover = document.querySelector('[data-js="profile-cover"]');

  $title.textContent = profile.nome;
  $author.textContent = profile.autor;
  $description.textContent = profile.descricao;
  $cover.setAttribute('src', profile.capa || './img/capa-padrao-podcast.jpg');
  $cover.setAttribute('alt', `Capa do ${profile.nome}`);
};

const handleBuscarProfile = () => {
  getProfile().then((profile) => {
    if (!profile.nome) {
      showView('EMPTY');
      return;
    }

    inserirProfileHtml(profile);
  });
};

handleBuscarProfile();

/*
  --------------------------------------------------------------------------------------
  Funções para adicionar profile
  --------------------------------------------------------------------------------------
*/
const postProfile = async (formData) => {
  try {
    return await httpClient('/profile', { body: formData });
  } catch (error) {
    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de adicionar o seu perfil: ${error.message}`,
      titulo: 'Falha ao adicionar perfil',
    });
  }
};

const handleAdicionarPerfilSubmitForm = async (e) => {
  const formData = new FormData(e.target);
  const perfilAdicionado = await postProfile(formData);

  if (!perfilAdicionado) return;

  openNotification({
    tipo: 'success',
    mensagem: `"${perfilAdicionado.nome}" foi adicionado com sucesso, você já pode adicionar episódios para escutar!`,
    titulo: 'Perfil adicionado com sucesso',
  });

  inserirProfileHtml(perfilAdicionado);
};

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
  if (!episodios) return;

  const markup = episodios
    .map((episodio) =>
      gerarCardEpisodioMarkup({
        ...episodio,
        capa: episodio.capa || './img/capa-padrao-podcast.jpg',
      })
    )
    .join('');

  $listEpisodiosContainer.innerHTML = markup;
};

const getListEpisodios = async () => {
  try {
    const { episodios } = await httpClient('episodios');
    return episodios;
  } catch (error) {
    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de listar os episódios. ${error.message}`,
      titulo: 'Falha ao buscar episódios',
    });

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
    const errorMessage = JSON.parse(error.message)?.message || error.message;

    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de deletar o seu episódio. ${errorMessage}`,
      titulo: 'Falha ao deletar episódio',
    });

    console.error(errorMessage);
  }
};

const handleDeleteEpisodioClick = async (episodioId) => {
  const episodioDeletado = await deleteEpisodio(episodioId);

  if (!episodioDeletado) return;

  openNotification({
    tipo: 'success',
    mensagem: `"${episodioDeletado.titulo}" removido da listagem`,
    titulo: 'Episódio removido com sucesso',
  });

  atualizarEpisodios();
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
    const errorMessage = JSON.parse(error.message)?.message || error.message;

    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de adicionar o seu episódio: ${errorMessage}`,
      titulo: 'Falha ao adicionar episódio',
    });
  }
};

const handleAdicionarEpisodioSubmitForm = async (e) => {
  const formData = new FormData(e.target);
  const episodioAdicionado = await postEpisodio(formData);

  if (!episodioAdicionado) return;

  openNotification({
    tipo: 'success',
    mensagem: `Você já pode escutar ${episodioAdicionado.titulo} na listagem`,
    titulo: 'Episódio adicionado com sucesso',
  });

  atualizarEpisodios();
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
    const errorMessage = JSON.parse(error.message)?.message || error.message;

    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de buscar o seu episódio. ${errorMessage}`,
      titulo: 'Falha ao buscar episódio',
    });

    console.error(errorMessage);
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
    const errorMessage = JSON.parse(error.message)?.message || error.message;

    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de editar o seu episódio. ${errorMessage}`,
      titulo: 'Falha ao editar episódio',
    });

    console.error(errorMessage);
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

const handleAtualizarEpisodioClick = async (episodioId) => {
  $formAtualizarEpisodio.reset();
  openDialog('ATUALIZAR_EPISODIO');
  await atualizarFormFields(episodioId);
};

const handleAtualizarEpisodioSubmitForm = async (e) => {
  const formData = new FormData(e.target);

  const episodioEditado = await editEpisodio(formData);

  if (!episodioEditado) return;

  openNotification({
    tipo: 'success',
    mensagem: `Você já pode ver as edições do "${episodioEditado.titulo}" na listagem`,
    titulo: 'Episódio atualizado com sucesso',
  });

  atualizarEpisodios();
};

/*
  --------------------------------------------------------------------------------------
  Funções para importar feed
  --------------------------------------------------------------------------------------
*/
const importarFeed = async (formData) => {
  try {
    return await httpClient('importacoes/feed-rss', { body: formData });
  } catch (error) {
    closeDialog();
    openNotification({
      tipo: 'error',
      mensagem: `Um erro aconteceu na hora de importar o feed: ${error.message}`,
      titulo: 'Falha ao importar RSS Feed',
    });
  }
};
const handleImportarFeedSubmitForm = async (e) => {
  const formData = new FormData(e.target);
  const result = await importarFeed(formData);

  if (!result) return;

  openNotification({
    tipo: 'success',
    mensagem: `Seu perfil e episódios estão prontos para serem ouvidos!`,
    titulo: 'Importação aconteceu com sucesso',
  });

  if (result.perfil?.nome) {
    inserirProfileHtml(result.perfil);
  } else {
    handleBuscarProfile();
  }

  if (result.episodios && result.episodios.length > 0) {
    inserirEpisodiosNaView(result.episodios);
  }
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
  const episodioId = Number(e.target.dataset.episodioId);

  if (!episodioId || typeof episodioId !== 'number') {
    return;
  }

  if (e.target.dataset.js === 'delete-episodio-btn') {
    handleDeleteEpisodioClick(episodioId);
  }

  if (e.target.dataset.js === 'atualizar-episodio-btn') {
    handleAtualizarEpisodioClick(episodioId);
  }
});

$formAtualizarEpisodio.addEventListener(
  'submit',
  handleAtualizarEpisodioSubmitForm
);

$buttonAdicionarPerfil.addEventListener('click', () => {
  $formAdicionarPerfil.reset();
  openDialog('NOVO_PERFIL');
});

$formAdicionarPerfil.addEventListener(
  'submit',
  handleAdicionarPerfilSubmitForm
);

$buttonImportarFeed.addEventListener('click', () => {
  $formImportarFeed.reset();
  openDialog('IMPORTAR_FEED');
});

$formImportarFeed.addEventListener('submit', handleImportarFeedSubmitForm);
