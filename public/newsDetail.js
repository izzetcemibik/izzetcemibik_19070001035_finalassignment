$(document).ready(function() {
    $('#likeForm').submit(function(e) {
        e.preventDefault();
        $.post('/like', $(this).serialize(), function(response) {
            $('.like-button').addClass('liked');
            $('.dislike-button').removeClass('disliked');
        }).fail(function() {
            alert('An error occurred while liking the news.');
        });
    });

    $('#dislikeForm').submit(function(e) {
        e.preventDefault();
        $.post('/dislike', $(this).serialize(), function(response) {
            $('.dislike-button').addClass('disliked');
            $('.like-button').removeClass('liked');
        }).fail(function() {
            alert('An error occurred while disliking the news.');
        });
    });
});
