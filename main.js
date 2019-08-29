
var urlApi = "http://157.230.17.132:4002/sales/";

function aggiungiValore(){

  var addAgente = $(".listaAgenti option:selected").val();
  console.log("selezionato",addAgente);

  var addMese = $(".listaMesi option:selected").val();
  console.log("selezionato mese",addMese);

  var inputVal = Number($(".valore").val());
  console.log("importo",inputVal);

  // var months = moment.months(Number(addMese));
  // console.log("converto in parole",months);

  $.ajax({
    url : urlApi,
    method : "POST",
    data : {
      salesman : addAgente,
      amount : inputVal,
      date : addMese

    },
    success : function(){
      console.log("aggiunto");

    },
    errror : function(){
      console.log("errore");
    }

  })
}





function selectMesi(){

    var months = moment.months();
    console.log(months);

    var source = $("#mesi-template").html();
    var template = Handlebars.compile(source);

    for (var i = 0; i < months.length; i++) {
      var base = months[i];

      var daInserire = {
        indice : i,
        mese : base
      }

      var html = template(daInserire);
      $(".listaMesi").append(html);
  }
}

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

    var amount = d.amount;

    //ciclo per il numero di agenti
    for (var x = 0; x < agenti.nome.length; x++) {
      //se il nome del agente di indice [i] = al nome dell agente
      // di indice x la somma con indice x somma l ammontare di indice i
      if (nome == agenti.nome[x]) {
        agenti.somma[x] += amount;
      }
    }

  }

  var tortaInt = 0;
  for (var x = 0; x < agenti.nome.length; x++) {
    tortaInt += agenti.somma[x];
    console.log(agenti.somma);
  }
  console.log("toooorta",tortaInt);


  for (var x = 0; x < agenti.nome.length; x++) {
    agenti.somma[x] = Math.round((tortaInt/agenti.somma[x])*10);
  }


  //select input
  var source = $("#agenti-template").html();
  var template = Handlebars.compile(source);

  for (var i = 0; i < agenti.nome.length; i++) {

    console.log(agenti.nome[i]);

    var daInserire = {
      agente : agenti.nome[i],
    }

    var html = template(daInserire);
    $(".listaAgenti").append(html);
  }


  return [agenti.somma,agenti.nome];

}

function getAmount(data){

  var monthProfit = new Array(12).fill(0);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    // console.log(d);

    var date = d.date;
    var amount = d.amount;

    //prendo il mese della data
    var mese = moment(date, "DD/MM/YYYY").month();
    // console.log("mese dell'incasso",mese);
    // console.log("relativo incasso",amount);
    // console.log("");

    monthProfit[mese] += amount;

  }

  // console.log("final amount per month",monthProfit);

  return monthProfit;

}

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

    },
    error: function(){

    }

  })

  //secondo grafico
  $.ajax({
    url : urlApi,
    method : "GET",

    success : function(data){
      var ctx = document.getElementById('myChartPie').getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: contributoAgente(data)[1],
              datasets: [{
                  label: '# of Votes',
                  data: contributoAgente(data)[0],
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
