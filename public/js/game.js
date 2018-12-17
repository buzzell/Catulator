const catulator = {
	vote: (e)=> {
		let winnerID = $(e.currentTarget).attr('data-id')
		let loserID = $(e.currentTarget).siblings('.catImg').attr('data-id')
		$('.stage').off('click', '.catImg')
		$.ajax({
			type: "POST",
			url: '/vote',
			contentType:"application/json",
			data: JSON.stringify({winner: winnerID, loser: loserID}),
			dataType:'json',
			success: (data) => {
				let r1 = data[0].rank;
				let id1 = data[0].id;
				let $el1 = $('#'+id1);
				let total1 = data[0].won + data[0].lost;
				let wonp1 = (data[0].won / total1) * 100;
				let lostp1 = (data[0].lost / total1) * 100;
				$el1.find('.rank').text(r1).css('visibility','visible');
				$el1.find('.scale').css('visibility','visible');
				$el1.find('.scale .good').width(wonp1+"%");
				$el1.find('.scale .bad').width(lostp1+"%");
				$el1.find('.stats').css('visibility','visible');
				$el1.find('.stats .won').text(data[0].won+' won');
				$el1.find('.stats .lost').text(data[0].lost+ ' lost');

				let r2 = data[1].rank;
				let id2 = data[1].id
				let $el2 = $('#'+id2);
				let total2 = data[1].won + data[1].lost;
				let wonp2 = (data[1].won / total2) * 100
				let lostp2 = (data[1].lost / total2) * 100
				$el2.find('.rank').text(r2).css('visibility','visible');
				$el2.find('.scale').css('visibility','visible');
				$el2.find('.scale .good').width(wonp2+"%");
				$el2.find('.scale .bad').width(lostp2+"%");
				$el2.find('.stats').css('visibility','visible');
				$el2.find('.stats .won').text(data[1].won+' won');
				$el2.find('.stats .lost').text(data[1].lost+ ' lost');

				if(r1 > r2){
					$el1.find('.rank').addClass('winner');
					$el2.find('.rank').addClass('loser');
				}else if(r2 > r1){;
					$el1.find('.rank').addClass('loser')
					$el2.find('.rank').addClass('winner');
				}else{
					$el1.find('.rank').addClass('tie');
					$el2.find('.rank').addClass('tie');
				}

				$('.stage').css('margin-bottom','48px');
				$('.game .btn').show().on('click', catulator.morecats);
			}
		});
	},
	morecats: () => {
		$('.game .btn').hide().off('click', catulator.morecats);
		$('.stage').css('margin-bottom','0');
		catulator.init();
	},
	init: () => {
		$.getJSON("/twocats.json", (cats) => {
			let stageHtml = `
				<p>Which cat is cuter?</p>
				<div class="catBox">
					<div id="${cats[0].id}" data-id="${cats[0].id}" class="catImg">
						<div class="rank">0</div>
						<img src="${cats[0].source}">
						<div class="scale clearfix">
							<div class="good"></div>
							<div class="bad"></div>
						</div>
						<div class="stats">
							<span class="won">0</span>
							<span class="lost">0</span>
						</div>
					</div>
					<div id="${cats[1].id}" data-id="${cats[1].id}" class="catImg">
						<div class="rank">0</div>
						<img src="${cats[1].source}">
						<div class="scale clearfix">
							<div class="good"></div>
							<div class="bad"></div>
						</div>
						<div class="stats">
							<span class="won">0</span>
							<span class="lost">0</span>
						</div>
					</div>
				</div>
			`;
			$('.stage').html(stageHtml)
		})
		$('.stage').on('click', '.catImg', catulator.vote);
	}
}
catulator.init();