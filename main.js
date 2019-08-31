
var urlApi = "http://157.230.17.132:4002/sales/";



function quadrimestri(data) {

  var quadrimestri = [];
  var quantita = [];

  for (var i=0;i<data.length;i++) {

    var date = data[i].date;
    var inc = data[i].amount;

    var mese = moment(date, "DD/MM/YYYY").month();

    //quadrimestri [0] non e' presente quindi lo creo e gli assegno 0
    if (!quadrimestri[mese]) {

      quadrimestri[mese] = 0;
      quantita[mese] = 0;
    }

    //quadrimestri[0] esiste sommo il valore corrispettivo
     quadrimestri[mese] += Number(inc);
     quantita[mese] += 1;


  }

  console.log(quantita);
  //somma per mese singolo
  console.log("somma mesi singoli",quadrimestri);

  var inizio = 0;
  var fine = 3;

  var singoli = [];
  var singoliQuantita = [];

  for (var i = 0; i < 4; i++) {
    var sliced = quadrimestri.slice(inizio, fine);
    var slicedQuantita = quantita.slice(inizio, fine);
    // console.log("trimestre numero ",i,"valori",quantita);

    singoli[i] = sliced;
    singoliQuantita[i] = slicedQuantita;

    inizio += 3;

    fine += 3;

  }

  console.log(singoliQuantita);

  var sumTrimestri = [];
  var quantitaTrimestri = [];

  for (var i = 0; i < singoli.length; i++) {
    sumTrimestri.push(singoli[i].reduce((a, b) => a + b, 0));
    quantitaTrimestri.push(singoliQuantita[i].reduce((a, b) => a + b, 0))

  }

  console.log("singoli",sumTrimestri);
  console.log("singoli",quantitaTrimestri);

  return [sumTrimestri,quantitaTrimestri];


}


function aggiungiValore(){

  var addAgente = $(".listaAgenti option:selected").val();
  console.log("agente selezionato",addAgente);

  var addMese = $(".listaMesi option:selected").val();
  console.log("mese selezionato ",addMese);

  var inputVal = Number($(".valore").val());
  console.log("importo inserito",inputVal);


  $.ajax({
    url : urlApi,
    method : "POST",
    data : {
      salesman : addAgente,
      amount : inputVal,
      date : "12/0" + addMese + "/2017"

    },
    success : function(){
      console.log("aggiunto");

    },
    errror : function(){
      console.log("errore");
    }

  })


};

function selectMesi(){

    var months = moment.months();
    // console.log(months);

    var source = $("#mesi-template").html();
    var template = Handlebars.compile(source);

    for (var i = 0; i < months.length; i++) {
      var mese = months[i];

      var daInserire = {
        indice : i,
        mese : mese
      }

      var html = template(daInserire);
      $(".listaMesi").append(html);
  }
};

function contributoAgente(data){

  var agenti = {
    nome : [],
    somma : []
  }

  for (var i = 0; i < data.length; i++) {
    var d = data[i];

    var nome = d.salesman;//

    if (!agenti.nome.includes(nome)) {
        agenti.nome.push(nome);
        agenti.somma.push(0);
    }

    var amount = Number(d.amount);

    //ciclo per il numero di agenti
    for (var x = 0; x < agenti.nome.length; x++) {
      //se il nome del agente di indice [i] = al nome dell agente
      // di indice x la somma con indice x somma l ammontare di indice i
      if (nome == agenti.nome[x]) {
        agenti.somma[x] += amount;
      }
    }

  }//fine ciclo for data

  var tortaInt = 0;
  for (var x = 0; x < agenti.somma.length; x++) {
    tortaInt += agenti.somma[x];
    // console.log(agenti.somma);
  }

  //trasformo in percentuale
  for (var x = 0; x < agenti.nome.length; x++) {
    agenti.somma[x] = ((agenti.somma[x]/tortaInt)*100);
    console.log(agenti.somma[x]);
    agenti.somma[x] = agenti.somma[x].toPrecision(3);
    console.log(agenti.somma[x]);

  }

  return agenti.somma;

};

function selectNomi(data){

  var nomiAgenti = [];

  for (var i = 0; i < data.length; i++) {
    var d = data[i];

    var nome = d.salesman;//

    if (!nomiAgenti.includes(nome)) {
        nomiAgenti.push(nome);
    }
  }


  var source = $("#agenti-template").html();
  var template = Handlebars.compile(source);

  for (var i = 0; i < nomiAgenti.length; i++) {

    // console.log(agenti.nome[i]);

    var daInserire = {
      agente : nomiAgenti[i],
    }

    var html = template(daInserire);
    $(".listaAgenti").append(html);
  }

  console.log(nomiAgenti);

  return nomiAgenti;


}


function getAmount(data){

  var monthProfit = new Array(12).fill(0);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    // console.log(d);

    var date = d.date;
    var amount = Number(d.amount);

    //prendo il mese della data
    var mese = moment(date, "DD/MM/YYYY").month();
    // console.log("mese dell'incasso",mese);
    // console.log("relativo incasso",amount);
    // console.log("");

    monthProfit[mese] += amount;

  }

  // console.log("final amount per month",monthProfit);

  return monthProfit;

};

function getData(){
  $.ajax({
    url : urlApi,
    method : "GET",

    success : function(data){

      var ctx = document.getElementById('myChart').getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: listMonth(),
              datasets: [{
                  label: '# of Votes',
                  data: getAmount(data),
                  backgroundColor: [
                      'rgba(203, 239, 255, 1)',
                  ]
              }]

          }
      });

      //secondo
      var ctx = document.getElementById('myChartPie').getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: selectNomi(data),
              datasets: [{
                  label: '# of Votes',
                  data: contributoAgente(data),
                  backgroundColor: [
                      'rgba(255, 99, 132,1)',
                      'rgba(54, 162, 235,1)',
                      'rgba(255, 206, 86,1)',
                      'rgba(75, 192, 192,1)',
                      'rgba(153, 102, 255,1)',
                      'rgba(255, 159, 64,1)'
                  ]
              }]
          }
      });


      //terzo
      var ctx = document.getElementById('myChartBar').getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ["Q1","Q2","Q3","Q4"],
              datasets: [{
                  label: '# of Votes',
                  data: quadrimestri(data)[1],
                  backgroundColor: [
                      'rgba(255, 99, 132,1)',
                      'rgba(54, 162, 235,1)',
                      'rgba(75, 192, 192,1)',
                      'rgba(153, 102, 255,1)',
                      'rgba(255, 159, 64,1)'
                  ]
              }]
          }
      });

      //quarto
      var ctx = document.getElementById('myChartBar2').getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ["Q1","Q2","Q3","Q4"],
              datasets: [{
                  label: '# of Votes',
                  data: quadrimestri(data)[0],
                  backgroundColor: [
                      'rgba(255, 99, 132,1)',
                      'rgba(54, 162, 235,1)',
                      'rgba(75, 192, 192,1)',
                      'rgba(153, 102, 255,1)',
                      'rgba(255, 159, 64,1)'
                  ]
              }]
          }
      });







    },
    error: function(){

    }

  })

}

function listMonth(){
  var months = moment.months();

  return months;
}

function init() {

  getData();

  selectMesi();

  $("button").click(aggiungiValore);


}

$(document).ready(init);
