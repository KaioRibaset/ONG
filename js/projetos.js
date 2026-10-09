/* A navegação agora fica sempre visível na navbar. */

/* 1. Carrossel de fotos */
const slides = document.querySelectorAll(".slide");
const pontos = document.querySelectorAll(".ponto");
const botaoAnterior = document.getElementById("slide-anterior");
const botaoProximo = document.getElementById("slide-proximo");

let slideAtual = 0;

function mostrarSlide(posicao) {
    if (!slides.length) return;

    if (posicao >= slides.length) posicao = 0;
    if (posicao < 0) posicao = slides.length - 1;

    slides.forEach(function (slide, indice) {
        slide.classList.toggle("ativo", indice === posicao);
    });

    pontos.forEach(function (ponto, indice) {
        ponto.classList.toggle("ativo", indice === posicao);
        ponto.setAttribute("aria-current", indice === posicao ? "true" : "false");
    });

    slideAtual = posicao;
}

if (slides.length) {
    if (botaoProximo) {
        botaoProximo.addEventListener("click", function () {
            mostrarSlide(slideAtual + 1);
        });
    }

    if (botaoAnterior) {
        botaoAnterior.addEventListener("click", function () {
            mostrarSlide(slideAtual - 1);
        });
    }

    pontos.forEach(function (ponto, indice) {
        ponto.addEventListener("click", function () {
            mostrarSlide(indice);
        });
    });

    mostrarSlide(0);
}

/*  2. Copiar a chave Pix  */
const botaoCopiar = document.getElementById("botao-copiar");
const chavePix = document.getElementById("chave-pix");
const mensagemPix = document.getElementById("mensagem-pix");

function mostrarMensagem(texto, tipo) {
    if (!mensagemPix) return;
    mensagemPix.textContent = texto;
    mensagemPix.className = "mensagem " + tipo;
}

if (botaoCopiar && chavePix) {
    botaoCopiar.addEventListener("click", async function () {
        const texto = chavePix.textContent.trim();

        try {
            await navigator.clipboard.writeText(texto);
            mostrarMensagem("Chave Pix copiada!", "sucesso");
        } catch (erro) {
            mostrarMensagem("Não foi possível copiar. Copie a chave manualmente.", "erro");
        }
    });
}

/*  3. Imagens que não carregaram  */
const fotosGaleria = document.querySelectorAll(".galeria img");

fotosGaleria.forEach(function (foto) {
    function verificarImagem() {
        if (!foto.naturalWidth) {
            foto.parentElement.classList.add("sem-imagem");
        }
    }

    if (foto.complete) verificarImagem();
    foto.addEventListener("error", verificarImagem);
});
