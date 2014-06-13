require(['$api/models','$views/image#Image'], function(models, Image) {
	var doCoverForAlbum = function(track) {
		track = models.Track.fromURI(track);
		var image = Image.forTrack(track, {width: '100%', height: '100%', player: false});
		document.getElementById('Cover').innerHTML="";
		document.getElementById('Cover').appendChild(image.node);
	};
	var slugify=function(str){
		str = str.replace("&",'e')
		str = str.replace(/^\s+|\s+$/g, ''); // trim
		str = str.toLowerCase();

		var from = "àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ·/_,:;";
		var to   = "aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY------";
		for (var i=0, l=from.length ; i<l ; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
		str = str.replace(/[^a-z0-9 -]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
		return str;
	}
	function strip_tags(html)
	{
		var tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText;
	}
	function getURL(url){
		$.ajaxSetup({async: false});
		var data="";
		$.get(url,function(d){
			data=d;
		});
		if(typeof data=="undefined"){
			data="";
		}
		return data;
	}
	currentTrack = function(track){
		document.getElementById('Cover').innerHTML="";
		document.getElementById('title').innerHTML="";
		document.getElementById('artist').innerHTML="";
		document.getElementById('lyrics').innerHTML="";

		if(typeof track =="undefined"){
			return;
		}
		document.getElementById('title').innerHTML=track.name;
		doCoverForAlbum(track.uri);
		document.getElementById('artist').innerHTML="";
		var artists=track.artists;
		var artist=[];
		for(var i = 0; i < artists.length; i++){
			artist.push(artists[i].name);
		}
		var isAd=false;
		try {
			isAd=track.data.isAd;
		}
		catch(err) {
			isAd=false;
		}
		document.getElementById('artist').innerHTML=artist.join(', ');
		if(track.name=="Spotify" || isAd){
			$("#lyrics").html("<br><br><br><h1>:-|</h1><br><br>");
			return;
		}
		trackname=track.name.split(/[\(\)\-]/g)
		trackname=trackname[0];
		var url = slugify(artist[0])+'/'+slugify(trackname);
		var url2 = slugify(artist[0])+'/m/'+slugify(trackname)+"/letra.html";
		var fontes=new Array(
			["vagalume.com.br",'http://www.vagalume.com.br/'+url+".html",'#lyr_original'],
			["letras.mus.br",'http://letras.mus.br/'+url+"/",'#div_letra'],
			["musica.com.br",'http://musica.com.br/artistas/'+url2,'.letra'],
			["cifraclub.com.br",'http://www.cifraclub.com.br/'+url+"/",' #ct_cifra']
		);
		for(var i in fontes){
			var f=fontes[i];
			var url=f[1]+" "+f[2];
			var d=getURL(url);
			console.log(url);
			var dx=strip_tags(d);
			dx=dx.replace(/\s/g,"");
			console.log(dx)
			if(d!="" && dx!=""){
				if(f[0]=='cifraclub.com.br'){
					d='<pre>'+d+'</pre>';
				}
				$("#lyrics").html('<br>'+d+'<br><a href="'+f[1]+'">Fonte: '+f[0]+'</a>');
				if(f[0]=='cifraclub.com.br'){
					$("#lyrics b").remove();
				}
				break;
			}
		}
		if($("#lyrics").html()==""){
			$("#lyrics").html("<br><br><br><h1>:(</h1><br><br>");
		}

	}
	models.player.load('track').done(function(p) {
		currentTrack(p.track);
	});
	models.player.addEventListener('change', function(p) {
		currentTrack(p.data.track);
	});
});