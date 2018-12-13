var catulator = {
    init: function(){
        $('.landing button').on('click', function(){
            $('.game').css('display','flex')
            $('.landing').animate({
                'top':'-100%',
                'opacity':'0'
            },350,function(){
                $(this).remove()
            })
        })
        $.ajax({
            url: '/php/game.php',
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            catulator.data = data
            $('.catBox').html(
                '<div class="catImg '+data[0].id+'" data-id="'+data[0].id+'">'+
                    '<img src="'+data[0].source.replace("http:","")+'">'+
                    '<i class="fa fa-search" aria-hidden="true"></i>'+
                '</div>'+
                '<div class="divider">'+
                    '<div>OR</div>'+
                '</div>'+
                '<div class="catImg '+data[1].id+'" data-id="'+data[1].id+'">'+
                    '<img src="'+data[1].source.replace("http:","")+'">'+
                    '<i class="fa fa-search" aria-hidden="true"></i>'+
                '</div>'
            )
        })
        $('.catBox').on('click','.catImg i',function(e){
            e.stopPropagation()
            $.SimpleLightbox.open({
                items: [$(this).siblings('img').attr('src')]
            })
        })
        $('.catBox').on('click', '.catImg', catulator.vote)
    },

    vote: function(e){
        $('.catBox').off('click','.catImg', catulator.vote)
        var id = $(this).attr('data-id')
        $.ajax({
            url: '/php/vote.php',
            type: 'GET',
            dataType: 'json',
            data: {'data':JSON.stringify(catulator.data), 'winner':id}
        }).done(function(results) {
            $('.'+results.winner.id).addClass('winner').prepend(
                '<div class="rbadge">'+
                    '<h3>Winner!</h3>'+
                    '<div>'+
                        '<div><span>rating</span>'+results.winner.rating+'</div>'+
                        '<div><span>won</span>'+results.winner.won+'</div>'+
                        '<div><span>lost</span>'+results.winner.lost+'</div>'+
                    '</div'+  
                '</div>')
            $('.'+results.loser.id).addClass('loser').prepend(
                '<div class="rbadge">'+
                    '<h3>Loser!</h3>'+
                    '<div>'+
                        '<div><span>rating</span>'+results.loser.rating+'</div>'+
                        '<div><span>won</span>'+results.loser.won+'</div>'+
                        '<div><span>lost</span>'+results.loser.lost+'</div>'+
                    '</div'+  
                '</div>')
            $('.morecats').slideDown(300, function() { $('.game').addClass('padding') });
            $('.morecats button').on('click',catulator.morecats)
        })
    },

    morecats: function(){
        $(this).off('click')
        $('.game').removeClass('padding')
        $('.morecats').slideUp(300);
        $('.catBox').html('<div class="spinner"></div>')
        $('.game > h2').hide();
        $.ajax({
            url: '/php/game.php',
            type: 'GET',
            dataType: 'json'
        })
        .done(function(data) {
            catulator.data = data
            $('.catBox').html(
                '<div class="catImg '+data[0].id+'" data-id="'+data[0].id+'">'+
                    '<img src="'+data[0].source.replace("http:","")+'">'+
                    '<i class="fa fa-search" aria-hidden="true"></i>'+
                '</div>'+
                '<div class="divider">'+
                    '<div>OR</div>'+
                '</div>'+
                '<div class="catImg '+data[1].id+'" data-id="'+data[1].id+'">'+
                    '<img src="'+data[1].source.replace("http:","")+'">'+
                    '<i class="fa fa-search" aria-hidden="true"></i>'+
                '</div>')
            $('.catBox').on('click', '.catImg', catulator.vote)
            $('.game > h2').show();
        })
    }
}
catulator.init()