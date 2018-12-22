
if (typeof(Storage) !== "undefined") {

	if(localStorage.catulatorAdded){
		var addedCats = JSON.parse(localStorage.catulatorAdded);
		console.log(addedCats.length)
		if(addedCats.length > 0){

			let addedHtml = "<h2>Cats you've added</h2>"
			let catHtml = "";
			$.each(addedCats, (i,v) => {
				catHtml += `
					<a href="http://devbox:3000/cats/${v.id}">
						<img src="${v.url}">
					</a>
				`

			})

			$(`
				<div class="addedCats">
					${addedHtml}
					${catHtml}
				</div>
			`).insertBefore('.add')

		}




	}else{
		


	}





}

function addTo(j){
	
	if(localStorage.catulatorAdded){
		
		var addedCats = JSON.parse(localStorage.catulatorAdded);
		addedCats.unshift(j)


	}else{
		
		var addedCats = new Array()
	
		addedCats.push(j)

	}
	localStorage.catulatorAdded = JSON.stringify(addedCats)
}


Dropzone.autoDiscover = false;
var myDropzone = new Dropzone("form", { 
	url: "/upload",
	maxFiles: 1,
	clickable:".dz-message .btn",
	acceptedFiles: "image/jpeg",
	autoProcessQueue: false,
	thumbnailWidth:500,
	thumbnailHeight:500,
	addRemoveLinks:true,
	dictRemoveFile:"✖",
	previewsContainer: ".dropzone-previews"
});
myDropzone.on("addedfile", function(file) {
	$('.submit').css('display','block')
}).on("maxfilesreached", function(file){
	$("form").hide();
	myDropzone.removeFile(file)
}).on("error", function(file, mes, xr){
	myDropzone.removeFile(file)
	$('.dz-error').text(mes).show()
	setTimeout(_=>{
		$('.dz-error').hide().text("")
	},3000)
}).on("removedfile", function(file){
	$('.submit').hide()
	$("form").show();
}).on("sending", function(file){
	$('.submit').hide()
	$('.dz-remove').hide()
}).on("success", function(file,res){

	if (typeof(Storage) !== "undefined") {
		addTo({id:res[0].id,url:res[0].url})
	}


	console.log(res)
	$('.add').append('<a href="/add" class="btn btn-link">Add another</a>')


});