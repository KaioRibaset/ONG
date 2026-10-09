// Menu hambúrguer: abre e fecha o painel do menu no celular
let botaoMenu = document.getElementById("botao-menu");
let menu = document.getElementById("menu-principal");

botaoMenu.addEventListener("click", function () {
    menu.classList.toggle("aberto");
});
