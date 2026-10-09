
const EMAIL_DA_ONG = "ribaskaio250@gmail.com";

const form = document.getElementById("form-contato");
const mensagemForm = document.getElementById("mensagem-contato");
const botaoEnviar = document.getElementById("botao-enviar");

function mostrarMensagem(texto, tipo) {
    mensagemForm.textContent = texto;
    mensagemForm.className = "mensagem " + tipo;
}

function mostrarErro(nome, texto) {
    const erro = document.getElementById("erro-" + nome);
    const campo = document.getElementById(nome);
    if (erro) erro.textContent = texto;
    if (campo) campo.setAttribute("aria-invalid", texto ? "true" : "false");
}


const regras = {
    nome: function (v) {
        return v.trim().length >= 3 ? "" : "Digite seu nome.";
    },
    email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
            ? ""
            : "Digite um e-mail válido, como nome@exemplo.com.";
    },
    assunto: function (v) {
        return v ? "" : "Escolha um assunto.";
    },
    mensagem: function (v) {
        return v.trim().length >= 10 ? "" : "Escreva uma mensagem com pelo menos 10 letras.";
    }
};

function validarCampo(nome) {
    const texto = regras[nome](document.getElementById(nome).value);
    mostrarErro(nome, texto);
    return texto === "";
}

Object.keys(regras).forEach(function (nome) {
    const campo = document.getElementById(nome);
    campo.addEventListener("blur", function () { validarCampo(nome); });
    campo.addEventListener("input", function () {
        if (campo.getAttribute("aria-invalid") === "true") validarCampo(nome);
    });
});

function linkMailto(dados) {
    const corpo = dados.mensagem + "\n\n--\n" + dados.nome + " (" + dados.email + ")";
    return "mailto:" + EMAIL_DA_ONG +
        "?subject=" + encodeURIComponent("[Site] " + dados.assunto) +
        "&body=" + encodeURIComponent(corpo);
}

function mostrarFalha(dados, motivo) {
    mensagemForm.className = "mensagem erro";
    mensagemForm.textContent = motivo + " ";
    const link = document.createElement("a");
    link.href = linkMailto(dados);
    link.textContent = "Enviar pelo meu programa de e-mail";
    mensagemForm.appendChild(link);
}

form.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    mostrarMensagem("", "");

    const resultados = Object.keys(regras).map(function (nome) {
        return { nome: nome, ok: validarCampo(nome) };
    });
    const primeiroErro = resultados.find(function (r) { return !r.ok; });
    if (primeiroErro) {
        document.getElementById(primeiroErro.nome).focus();
        mostrarMensagem("Confira os campos marcados em vermelho.", "erro");
        return;
    }

    if (document.getElementById("site").value) {
        form.reset();
        mostrarMensagem("Mensagem enviada! Obrigado pelo contato.", "sucesso");
        return;
    }

    const dados = {
        nome: document.getElementById("nome").value.trim(),
        email: document.getElementById("email").value.trim(),
        assunto: document.getElementById("assunto").value,
        mensagem: document.getElementById("mensagem").value.trim()
    };

    if (EMAIL_DA_ONG === "seuemail@exemplo.com") {
        mostrarMensagem("Falta configurar o e-mail da ONG em js/contato.js (constante EMAIL_DA_ONG).", "erro");
        return;
    }

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando...";

    try {
        const resposta = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(EMAIL_DA_ONG), {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                "Nome": dados.nome,
                "E-mail": dados.email,
                "Assunto": dados.assunto,
                "Mensagem": dados.mensagem,
                "_replyto": dados.email,
                "_subject": "[Site Alimentar com Amor] " + dados.assunto,
                "_template": "table",
                "_captcha": "false"
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok && String(resultado.success) === "true") {
            form.reset();
            form.querySelectorAll("[aria-invalid]").forEach(function (c) { c.removeAttribute("aria-invalid"); });
            mostrarMensagem("Mensagem enviada! Responderemos em breve no e-mail informado.", "sucesso");
        } else {
            mostrarFalha(dados, "Não foi possível enviar agora.");
        }
    } catch (erro) {
        mostrarFalha(dados, "Não foi possível enviar. Verifique sua conexão.");
    } finally {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Enviar mensagem";
    }
});
