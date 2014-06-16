require(['$api/models','$views/image#Image'], function(models, Image) {
	var slugify = function(str) {
		str = str.replace(/^\s+|\s+$/g, '');
		str = str.toLowerCase();
		var from = "àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ·/_,:;&";
		var to   = "aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY------e";
		for (var i = 0, l = from.length; i < l ; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
		str = str.replace(/[^a-z0-9 -]/g, '')
		str = str.replace(/\s+/g, '-');
		str = str.replace(/-+/g, '-');
		return str;
	}
	var strip_tags = function(html) {
		var tmp = document.createElement("div");
		tmp.innerHTML = html;
		return tmp.textconteudo || tmp.innerText;
	}
	var getURL = function(url) {
		var data = "";
		$.ajaxSetup({async: false});
		$.get(url, function(d) { data = d; });
		if(typeof data == "undefined")
			data = "";
		return data;
	}
	var carregaMusica = function(track) {
		if (typeof track == "undefined"){
			$('#capa, #titulo, #artista, #letra').html("");
			return;
		}
		var track = models.Track.fromURI(track.uri);
		if($('#titulo').html()==track.name)
			return;
		$('#capa, #titulo, #artista, #letra').html("");
		image = Image.forTrack(track, {width: '100%', height: '100%', player: false});
		$('#titulo').html(track.name);
		$('#capa').fadeOut().html('').append(image.node).fadeIn();
		var artists = track.artists;
		var artistas = [];
		for (var i = 0; i < artists.length; i++) {
			artistas.push(artists[i].name);
		}
		var isAd = false;
		try { isAd = track.data.isAd; }
		catch (err) { isAd = false; }
		$('#artista').html(artistas.join(', '));
		if (track.name == "Spotify" || artistas[0] == "Spotify" || isAd) {
			$("#letra").html("<br><br>" +
							 "<h1>:-|</h1>" +
							 "<br><br>");
			return;
		}
		var musica = track.name.split(/[\(\)\-]/g)[0];
		var sMusica = slugify(musica);
			var fontes = new Array(
				["vagalume.com.br", "http://www.vagalume.com.br/__artista/" + sMusica + ".html", "#lyr_original"],
				["letras.mus.br", "http://letras.mus.br/__artista/" + sMusica + "/", "#div_letra"],
				["musica.com.br", "http://musica.com.br/artistas/__artista/m/" + sMusica + "/letra.html", '.letra'],
				["cifraclub.com.br", "http://www.cifraclub.com.br/__artista/" + sMusica + "/", '#ct_cifra']
			);
		for (var i in artistas) {
			var sArtista = slugify(artistas[i]);
			for (var j in fontes) {
				var f = fontes[j];
				var url = f[1].replace("__artista",sArtista) + " " + f[2];
				var d = getURL(url);
				var dx = strip_tags(d);
				dx = dx.replace(/\s/g,"");
				if (d != "" && dx != "") {
					if (f[0] == 'cifraclub.com.br')
						d = "<pre>" + d + "</pre>";
					$("#letra").html("<br>" + d + "<br>" +
									 "<a href=\"" + f[1].replace("__artista",sArtista) + "\">Fonte: " + f[0] + "</a>");
					if (f[0] == 'cifraclub.com.br')
						$("#letra b").remove();
					return;
				}
			}
		}
		$("#letra").html("<br><br>" +
						 "<h1>:(</h1>" +
						 "<br><br>");
	}
	models.player.load('track').done(function(p) {
		carregaMusica(p.track);
	});
	models.player.addEventListener('change', function(p) {
		carregaMusica(p.data.track);
	});
	var tamanho = [32, 24, 18];
	var elementos = ["h1","h2","#letra"];
	$("#aumentar").click(function(){
		for (var i in elementos) {
			var t=parseInt($(elementos[i]).css("font-size"))||tamanho[i];
			t+=1;
			if(t>tamanho[i]+10)
				t=tamanho[i]+10;
			$(elementos[i]).css("font-size",t+"px");
		};
	})
	$("#diminuir").click(function(){
		for (var i in elementos) {
			var t=parseInt($(elementos[i]).css("font-size"))||tamanho[i];
			t-=1;
			if(t<tamanho[i]-8)
				t=tamanho[i]-8;
			$(elementos[i]).css("font-size",t+"px");
		};
	})
	$("#normal").click(function(){
		for (var i in elementos) {
			var t=tamanho[i];
			$(elementos[i]).css("font-size",t+"px");
		};
	})
});