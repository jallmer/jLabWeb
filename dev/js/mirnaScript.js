$(document).ready(function() {
  fillForm();
  $("#submit").click(function() {
    var inputFasta = $("#inputFasta").val();
    var feat = $("#feat").val();
    var email = $("#email").val();
    if(inputFasta == ''){
      inputFasta = ">hsa-let-7a-1 MI0000060\nUGGGAUGAGGUAGUAGGUUGUAUAGUUUUAGGGUCACACCCACCACUGGGAGAUAACUAUACAAUCUACUGUCUUUCCUA\n>hsa-let-7a-2 MI0000061\nAGGUUGAGGUAGUAGGUUGUAUAGUUUAGAAUUACAUCAAGGGAGAUAACUGUACAGCCUCCUAGCUUUCCU\n>hsa-let-7a-3 MI0000062\nGGGUGAGGUAGUAGGUUGUAUAGUUUGGGGCUCUGCCCUGCUAUGGGAUAACUAUACAAUCUACUGUCUUUCCU\n>hsa-let-7b MI0000063\nCGGGGUGAGGUAGUAGGUUGUGUGGUUUCAGGGCAGUGAUGUUGCCCCUCGGAAGAUAACUAUACAACCUACUGCCUUCCCUG\n>hsa-let-7c MI0000064\nGCAUCCGGGUUGAGGUAGUAGGUUGUAUGGUUUAGAGUUACACCCUGGGAGUUAACUGUACAACCUUCUAGCUUUCCUUGGAGC"
    }
    // Returns successful data submission message when the entered information is stored in database.


    else if(validateFasta() == false){
      alert("Please check your Fasta input");
    }
    else {
      //var dataString = 'inputFasta=' + inputFasta + '&feat=' + feat + '&email=' + email;
      //var dataStringClear = encodeURI(dataString);
      var runId = Math.floor((Math.random() * 1000000) + 100000);
      var data = {inputFasta:inputFasta,feat:encodeURI(feat),email:email,runId:runId};
      document.getElementById("mirnaForm").reset();
      var featBox = document.getElementById("feat");
      i = featBox.options.length;
      if (i < 1) {
        $("#feat").css('background-color','rgba(200,0,0,0.2)');
        return false;
      }
      if(email == ""){
        $("#email").css('background-color','rgba(200,0,0,0.2)');
        return false;
      }
      while(i--){
        featBox.options[i] = null;
      }
      fillForm();
      $("<div><center><h4><br><br>Your request has been queued with the ID:" + runId + "<br>The results will be e-mailed to you after they are calculated.</h4></center></div>").appendTo("#resultDiv");

      // AJAX Code To Submit Form.
      $.ajax({
        type: "POST",
        url: "/software/mirna/calcMirna",
        data: data,
        cache: false,
        success: function(result) {
          if (result.indexOf("success") != -1) {
            console.log(result);
            $("<div><br></br><center><h4>Please go check your e-mail. Your calculation is done</center></h4></div>").appendTo("#resultDiv");
            //$("<div><center><h4><br><br>Your job has been queued with the ID: " + resSplit[1] + " <br>The results will be e-mailed to you after they are calculated.<br>Meanwhile, you can check the status of your job at XXX </h4></center></div>").appendTo("#resultDiv");
          } else {
            console.log(result);
            $("<div><br></br><center><h4>" + result + "</center></h4></div>").appendTo("#resultDiv");
          }
        }
      });
    }
    return false;
  });
});


      function fillForm() {
        $.ajax({
          type: "GET",
          url: "http://10.2.30.139:3000/mirna/featList.txt",
          success: function(text) {
            var lines = text.split("\n");
            var seqFeat = [];
            var strFeat = [];
            var therFeat = [];
            var probFeat = [];
            var lineSplit = [];
            var featType = "";
            for (var i = 0; i < lines.length - 1; i++) {
              lineSplit = lines[i].split("\t");
              lineSplit[0] = lineSplit[0].replace(/\+/g, 'plus');
              featType = lineSplit[1];
              if (featType.indexOf("Sequential") > -1) {
                seqFeat.push(lineSplit[0]);
              }
              if (featType.indexOf("Structural") > -1) {
                strFeat.push(lineSplit[0]);
              }
              if (featType.indexOf("Thermodynamic") > -1) {
                therFeat.push(lineSplit[0]);
              }
              if (featType.indexOf("Probabilistic") > -1) {
                probFeat.push(lineSplit[0]);
              }
            }

            var sel = document.getElementById('seq');
            for (var i = 0; i < seqFeat.length; i++) {
              var opt = document.createElement('option');
              opt.innerHTML = seqFeat[i].replace(/plus/g, '+');
              opt.value = seqFeat[i];
              sel.appendChild(opt);
            }

            var sel = document.getElementById('str');
            for (var i = 0; i < strFeat.length; i++) {
              var opt = document.createElement('option');
              opt.innerHTML = strFeat[i].replace(/plus/g, '+');;
              opt.value = strFeat[i];
              sel.appendChild(opt);
            }

            var sel = document.getElementById('thermo');
            for (var i = 0; i < therFeat.length; i++) {
              var opt = document.createElement('option');
              opt.innerHTML = therFeat[i].replace(/plus/g, '+');;
              opt.value = therFeat[i];
              sel.appendChild(opt);
            }

            var sel = document.getElementById('stat');
            for (var i = 0; i < probFeat.length; i++) {
              var opt = document.createElement('option');
              opt.innerHTML = probFeat[i].replace(/plus/g, '+');;
              opt.value = probFeat[i];
              sel.appendChild(opt);
            }
          },
          error: function() {
            console.log("File could not be retrieved");
          }
        });
      }



      function move(sens, src) {
        var i, sourceSel, targetSel;
        if (src == 'seq') {
          if (sens == 'down') {
            sourceSel = document.getElementById('seq');
            targetSel = document.getElementById('feat');
          } else {
            sourceSel = document.getElementById('feat');
            targetSel = document.getElementById('seq');
          }
        } else if (src == 'str') {
          if (sens == 'down') {
            sourceSel = document.getElementById('str');
            targetSel = document.getElementById('feat');
          } else {
            sourceSel = document.getElementById('feat');
            targetSel = document.getElementById('str');
          }
        } else if (src == 'stat') {
          if (sens == 'down') {
            sourceSel = document.getElementById('stat');
            targetSel = document.getElementById('feat');
          } else {
            sourceSel = document.getElementById('feat');
            targetSel = document.getElementById('stat');
          }
        } else if (src == 'thermo') {
          if (sens == 'down') {
            sourceSel = document.getElementById('thermo');
            targetSel = document.getElementById('feat');
          } else {
            sourceSel = document.getElementById('feat');
            targetSel = document.getElementById('thermo');
          }
        }

        i = sourceSel.options.length;
        while (i--) {
          if (sourceSel.options[i].selected) {
            targetSel.appendChild(sourceSel.options[i]);
          }
        }
      }

      function selectAll() {
        selectBox = document.getElementById('feat');
        var i;
        i = selectBox.options.length;
        while (i--) {
          selectBox.options[i].selected = true;
        }
        var hplBox = document.getElementById('hpl');
        var slBox = document.getElementById('sl');
        i = selectBox.options.length;
        while (i--) {
          //if (!((selectBox.options[i].innerHTML.indexOf('dns') > -1) || (selectBox.options[i].innerHTML.indexOf('/hpl') > -1) || (selectBox.options[i].innerHTML.indexOf('/sl') > -1))) {
          if (!(selectBox.options[i].innerHTML.indexOf('dns') > -1)) {
            if (hplBox.checked) {
              var opt = document.createElement('option');
              opt.innerHTML = selectBox.options[i].innerHTML + "/hpl";
              opt.value = selectBox.options[i].value + "/hpl";
              opt.selected = true;
              selectBox.appendChild(opt);
            }
            if (slBox.checked) {
              var opt = document.createElement('option');
              opt.innerHTML = selectBox.options[i].innerHTML + "/sl";
              opt.value = selectBox.options[i].value + "/sl";
              opt.selected = true;
              selectBox.appendChild(opt);
            }
          }
        }
      }

      function validateFasta() {

        var fasta = $("#inputFasta").val();
        if(fasta == "")
          return false;
        fasta = fasta.split("\n");
        var header = "";
        var seq = "";
        var numFasta = 0;
        for(var i = 0; i < fasta.length; i++){
          console.log(fasta.length);
          if(fasta[i].indexOf('>') == 0){
            numFasta++;
            if(header.length === 0){
              header = fasta[i];
            }
          }else{
            if(!(/^[AUGC\s]+$/i.test(fasta[i]))){
              console.log("not valid RNA sequence");
              return false;
            }
            seq = seq + fasta[i];
          }
        }

        if(numFasta > 5){
          console.log("you can run at most 5 sequences at a time");
          return false;
        }
        return true;

      }
