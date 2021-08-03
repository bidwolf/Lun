"use strict";

//faz o calculo das saídas do programa utilizando os dados digitados nos inputs anteriores

function calcular() {

    // Variáveis passadas para o script pelos inputs do documento html

    var empréstimo = document.getElementById("montante");
    var taxaAnual = document.getElementById("taxaAnual");
    var anos = document.getElementById("anos");
    var cep = document.getElementById("cep");
    var pagamentoMensal = document.getElementById("pagamentoMensal");
    var pagamentoTotal = document.getElementById("pagamentoTotal");
    var jurosTotais = document.getElementById("jurosTotais");

    // Variáveis utilizadas para armazenar os cálculos e retornar para o documento html na forma de outputs

    var capital = parseFloat(empréstimo.value);
    var taxaMensal = parseFloat(taxaAnual.value) / 100 / 12;
    var meses = parseFloat(anos.value) * 12;

    var juroComposto = Math.pow((1 + taxaMensal), meses); // juros mensais

    // Acredite ou não isso é um fórmula matemática utilizada para calcular o valor de parcelas periódicas PRICE.

    var parcela = (capital * juroComposto * taxaMensal) / (juroComposto - 1);

    if (isFinite(parcela)) {
        pagamentoMensal.innerHTML = parcela.toFixed(2);
        pagamentoTotal.innerHTML = (parcela * meses).toFixed(2);
        jurosTotais.innerHTML = ((parcela * meses) - capital).toFixed(2);
        save(empréstimo.value, taxaAnual.value, anos.value, cep.value);
        chart(capital, taxaMensal, parcela, meses);
    } else {
        pagamentoMensal.innerHTML = "";
        pagamentoTotal.innerHTML = "";
        jurosTotais.innerHTML = "";
        chart();
    }

}
// caso haja compatibilidade, salva os dados digitados em armazenamento local
function save(montante, taxaAnual, anos, cep) {
    if (window.localStorage) {
        localStorage.empréstimo_montante = montante;
        localStorage.empréstimo_taxaAnual = taxaAnual;
        localStorage.empréstimo_anos = anos;
        localStorage.empréstimo_cep = cep;



    }

}
//faz o carregamento dos dados salvos. caso haja compatibilidade com armazenamento local
window.onload = function() {
    if (window.localStorage && localStorage.empréstimo_montante) {
        document.getElementById("montante").value = localStorage.empréstimo_montante;
        document.getElementById("taxaAnual").value = localStorage.empréstimo_taxaAnual;
        document.getElementById("anos").value = localStorage.empréstimo_anos;
        document.getElementById("cep").value = localStorage.empréstimo_cep;
    }
};
//faz o gráfico do saldo devedor mensal, dos juros e do capital, se não houver argumentos apaga o gráfico
function chart(capital, taxaMensal, parcelas, meses) {

    var graph = document.getElementById("graph");
    graph.width = graph.width; // alguma manobra pra redefinir o gráfico ou algo assim
    if (arguments.length == 0 || !graph.getContext) return;
    var g = graph.getContext("2d");
    var width = graph.width;
    var height = graph.height;

    // Eixos x e y

    function paymentToX(n) {
        return n * width / meses; //Convertendo números de meses em pixels para mostrar no gráfico
    }

    function montanteToY(a) {
        return height - ((a * height) / (parcelas * meses * 1.05)); // utiliza a altura máxima como escala
    }
    //os pagamentos formam uma linha reta do ponto P1:(0,0) até P2:(meses,parcelas*meses)
    g.moveTo(paymentToX(0), montanteToY(0));
    g.lineTo(paymentToX(meses), montanteToY(parcelas * meses));
    g.lineTo(paymentToX(meses), montanteToY(0));
    g.closePath();
    g.fillStyle = "yellow";
    g.fill();
    g.font = "bold 12px sans-serif";
    g.fillText("Pagamento de juros totais", 20, 20);
    var equity = 0;
    g.beginPath();
    g.moveTo(paymentToX(0), montanteToY(0));
    for (let index = 1; index < meses; index++) {
        var juroMensal = (capital - equity) * taxaMensal
        equity += (parcelas - juroMensal);
        g.lineTo(paymentToX(index), montanteToY(equity));

    }
    g.lineTo(paymentToX(meses), montanteToY(0));
    g.closePath();
    g.fillStyle = "orange";
    g.fill();
    g.fillText("Patrimônio Líquido Cumulativo total", 20, 35);
    var bal = capital;
    g.beginPath();
    g.moveTo(paymentToX(0), montanteToY(bal));
    for (let index = 1; index < meses; index++) {
        var juroMensal = bal * taxaMensal
        bal -= (parcelas - juroMensal);
        g.lineTo(paymentToX(index), montanteToY(bal));

    }
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = "white";
    g.fillText("Balanço do empréstimo", 20, 50);
    g.fillStyle = "black";
    g.textAlign = "center";
    var y = montanteToY(0);
    for (let mes = 1; mes * 12 <= meses; mes++) {
        var x = paymentToX(mes * 12);
        g.fillRect(x - 0.5, y - 3, 1, 3);
        if (mes == 1) g.fillText("Anos", x, y - 5);
        if (mes % 2 == 0 && mes * 12 != meses) g.fillText(String(mes), x, y - 5);
    }
    g.textAlign = "right";
    g.textBaseLine = "middle";
    var ticks = [meses * juroMensal, capital];
    var r_edge = paymentToX(meses);
    for (let index = 0; index < ticks.length; index++) {
        var y = montanteToY(String(ticks[index].toFixed(0)), r_edge - 5, y);

    }
}