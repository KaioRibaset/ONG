/* ==========================================================
   CADASTRO DE VOLUNTÁRIOS
   Tudo fica salvo no localStorage: só existe neste computador,
   neste navegador. Nada é enviado para a internet.
   ========================================================== */

const CHAVE_STORAGE = "alimentarComAmor.voluntarios";
const IDADE_MINIMA = 18; // mude aqui se a ONG aceitar menores

const form = document.getElementById("form-cadastro");
const mensagemForm = document.getElementById("mensagem-cadastro");
const listaEl = document.getElementById("lista-voluntarios");
const listaVazia = document.getElementById("lista-vazia");
const totalEl = document.getElementById("total");
const botaoCsv = document.getElementById("botao-csv");
const botaoApagarTudo = document.getElementById("botao-apagar-tudo");
const campoTelefone = document.getElementById("telefone");
const campoMensagem = document.getElementById("mensagem");
const contador = document.getElementById("contador");

/* ---------- 1. Guardar e ler os dados ---------- */
function lerVoluntarios() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

function salvarVoluntarios(lista) {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
        return true;
    } catch (erro) {
        return false; // navegador bloqueou o armazenamento
    }
}

/* ---------- 2. Mensagens na tela ---------- */
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

/* ---------- 3. Regras de validação ---------- */
function calcularIdade(dataTexto) {
    const nasc = new Date(dataTexto + "T00:00:00");
    if (isNaN(nasc)) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const fezAniversario =
        hoje.getMonth() > nasc.getMonth() ||
        (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
    if (!fezAniversario) idade--;
    return idade;
}

const regras = {
    nome: function (v) {
        v = v.trim();
        if (v.length < 3) return "Digite seu nome completo.";
        if (v.split(/\s+/).length < 2) return "Digite nome e sobrenome.";
        return "";
    },
    email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
            ? ""
            : "Digite um e-mail válido, como nome@exemplo.com.";
    },
    telefone: function (v) {
        const n = v.replace(/\D/g, "").length;
        return n === 10 || n === 11 ? "" : "Digite o telefone com DDD.";
    },
    nascimento: function (v) {
        if (!v) return "Informe sua data de nascimento.";
        const idade = calcularIdade(v);
        if (idade === null || idade < 0 || idade > 120) return "Data de nascimento inválida.";
        if (idade < IDADE_MINIMA) return "É preciso ter pelo menos " + IDADE_MINIMA + " anos.";
        return "";
    },
    cidade: function (v) {
        return v.trim().length >= 2 ? "" : "Digite o nome da sua cidade.";
    },
    projeto: function (v) {
        return v ? "" : "Escolha um projeto.";
    }
};

function validarCampo(nome) {
    const campo = document.getElementById(nome);
    const texto = regras[nome](campo.value);
    mostrarErro(nome, texto);
    return texto === "";
}

function validarDias() {
    const marcados = form.querySelectorAll('input[name="dias"]:checked').length;
    const texto = marcados ? "" : "Marque pelo menos um dia.";
    document.getElementById("erro-dias").textContent = texto;
    return texto === "";
}

function validarAceite() {
    const aceite = document.getElementById("aceite");
    const texto = aceite.checked ? "" : "Você precisa concordar para continuar.";
    mostrarErro("aceite", texto);
    return texto === "";
}

/* ---------- 4. Máscara do telefone: (11) 91234-5678 ---------- */
campoTelefone.addEventListener("input", function () {
    let n = campoTelefone.value.replace(/\D/g, "").slice(0, 11);
    if (n.length > 10) {
        n = n.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    } else if (n.length > 6) {
        n = n.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (n.length > 2) {
        n = n.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else if (n.length > 0) {
        n = n.replace(/^(\d*)/, "($1");
    }
    campoTelefone.value = n;
});

/* Contador de caracteres do campo de mensagem */
campoMensagem.addEventListener("input", function () {
    contador.textContent = campoMensagem.value.length;
});

/* Valida cada campo quando a pessoa sai dele, e limpa o erro ao corrigir */
Object.keys(regras).forEach(function (nome) {
    const campo = document.getElementById(nome);
    campo.addEventListener("blur", function () {
        validarCampo(nome);
    });
    campo.addEventListener("input", function () {
        if (campo.getAttribute("aria-invalid") === "true") validarCampo(nome);
    });
});

form.querySelectorAll('input[name="dias"]').forEach(function (caixa) {
    caixa.addEventListener("change", validarDias);
});
document.getElementById("aceite").addEventListener("change", validarAceite);

/* ---------- 5. Enviar o cadastro ---------- */
form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mostrarMensagem("", "");

    const resultados = Object.keys(regras).map(function (nome) {
        return { nome: nome, ok: validarCampo(nome) };
    });
    const diasOk = validarDias();
    const aceiteOk = validarAceite();

    if (resultados.some(function (r) { return !r.ok; }) || !diasOk || !aceiteOk) {
        const primeiroErro = resultados.find(function (r) { return !r.ok; });
        if (primeiroErro) {
            document.getElementById(primeiroErro.nome).focus();
        } else if (!diasOk) {
            form.querySelector('input[name="dias"]').focus();
        } else {
            document.getElementById("aceite").focus();
        }
        mostrarMensagem("Confira os campos marcados em vermelho.", "erro");
        return;
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const lista = lerVoluntarios();

    if (lista.some(function (v) { return v.email === email; })) {
        mostrarErro("email", "Este e-mail já está cadastrado neste computador.");
        document.getElementById("email").focus();
        mostrarMensagem("Cadastro não realizado.", "erro");
        return;
    }

    const dias = Array.from(form.querySelectorAll('input[name="dias"]:checked')).map(function (c) {
        return c.value;
    });

    lista.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        nome: document.getElementById("nome").value.trim(),
        email: email,
        telefone: campoTelefone.value.trim(),
        nascimento: document.getElementById("nascimento").value,
        cidade: document.getElementById("cidade").value.trim(),
        projeto: document.getElementById("projeto").value,
        dias: dias,
        mensagem: campoMensagem.value.trim(),
        cadastradoEm: new Date().toISOString()
    });

    if (!salvarVoluntarios(lista)) {
        mostrarMensagem("Não foi possível salvar. Verifique se o navegador permite armazenamento.", "erro");
        return;
    }

    const primeiroNome = document.getElementById("nome").value.trim().split(/\s+/)[0];
    form.reset();
    contador.textContent = "0";
    limparErros();
    mostrarMensagem("Cadastro realizado, " + primeiroNome + "! Obrigado por querer ajudar.", "sucesso");
    desenharLista();
});

function limparErros() {
    form.querySelectorAll(".erro-campo").forEach(function (p) { p.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach(function (c) { c.removeAttribute("aria-invalid"); });
}

document.getElementById("botao-limpar").addEventListener("click", function () {
    limparErros();
    mostrarMensagem("", "");
    contador.textContent = "0";
});

/* ---------- 6. Mostrar a lista ---------- */
function formatarDataHora(iso) {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function criarLinha(texto, rotulo) {
    const p = document.createElement("p");
    if (rotulo) {
        const forte = document.createElement("strong");
        forte.textContent = rotulo + " ";
        p.appendChild(forte);
    }
    p.appendChild(document.createTextNode(texto));
    return p;
}

function desenharLista() {
    const lista = lerVoluntarios();
    listaEl.innerHTML = "";

    listaVazia.hidden = lista.length > 0;
    botaoCsv.disabled = lista.length === 0;
    botaoApagarTudo.disabled = lista.length === 0;
    totalEl.textContent = lista.length ? "(" + lista.length + ")" : "";

    lista.forEach(function (v) {
        const item = document.createElement("li");
        item.className = "cartao voluntario";

        const etiqueta = document.createElement("span");
        etiqueta.className = "badge";
        etiqueta.textContent = v.projeto;

        const titulo = document.createElement("h3");
        titulo.textContent = v.nome;

        item.appendChild(etiqueta);
        item.appendChild(titulo);
        item.appendChild(criarLinha(v.email, "E-mail:"));
        item.appendChild(criarLinha(v.telefone, "Telefone:"));
        item.appendChild(criarLinha(v.cidade, "Cidade:"));
        item.appendChild(criarLinha(v.dias.join(", "), "Dias:"));
        if (v.mensagem) item.appendChild(criarLinha(v.mensagem, "Mensagem:"));

        const data = document.createElement("p");
        data.className = "data";
        data.textContent = "Cadastrado em " + formatarDataHora(v.cadastradoEm);
        item.appendChild(data);

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "botao botao-sec";
        remover.textContent = "Remover";
        remover.setAttribute("aria-label", "Remover cadastro de " + v.nome);
        remover.addEventListener("click", function () {
            if (!confirm("Remover o cadastro de " + v.nome + "?")) return;
            salvarVoluntarios(lerVoluntarios().filter(function (x) { return x.id !== v.id; }));
            desenharLista();
        });
        item.appendChild(remover);

        listaEl.appendChild(item);
    });
}

botaoApagarTudo.addEventListener("click", function () {
    const total = lerVoluntarios().length;
    if (!total) return;
    if (!confirm("Apagar os " + total + " cadastros deste computador? Isso não pode ser desfeito.")) return;
    salvarVoluntarios([]);
    desenharLista();
});

/* ---------- 7. Baixar a lista em CSV (abre no Excel) ---------- */
function celulaCsv(valor) {
    let texto = String(valor == null ? "" : valor);
    if (/^[=+\-@]/.test(texto)) texto = "'" + texto; // evita fórmulas maliciosas no Excel
    return '"' + texto.replace(/"/g, '""') + '"';
}

botaoCsv.addEventListener("click", function () {
    const lista = lerVoluntarios();
    if (!lista.length) return;

    const cabecalho = ["Nome", "E-mail", "Telefone", "Nascimento", "Cidade", "Projeto", "Dias", "Mensagem", "Cadastrado em"];
    const linhas = lista.map(function (v) {
        return [v.nome, v.email, v.telefone, v.nascimento, v.cidade, v.projeto, v.dias.join(" / "), v.mensagem, formatarDataHora(v.cadastradoEm)]
            .map(celulaCsv).join(";");
    });

    const csv = "\uFEFF" + [cabecalho.map(celulaCsv).join(";")].concat(linhas).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "voluntarios.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});

/* Ao abrir a página, mostra o que já estava salvo */
desenharLista();
