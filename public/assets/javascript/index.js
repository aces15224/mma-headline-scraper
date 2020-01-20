$(document).ready(function() {
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);
  $(".clear").on("click", handleArticleClear);
  
  
     $.get("/api/headlines?saved=false").then(function(data) {
      articleContainer.empty();
      if (data && data.length) {
        renderArticles(data);
      } else {
        renderEmpty();
      }
    });
  
  $(window).resize(function() {
    if (window.innerWidth > 991){
      document.location.reload();
    } 
  });


  function renderArticles(articles) { 
    var articleCards = [];
    for (var i = 0; i < articles.length; i++) {
      if(articles[i].summary.length > 13 && articles[i].saved == false && articles[i].headline != ""){
        articleCards.push(createCard(articles[i]));
        }
      }
    articleContainer.append(articleCards);
  }

  function createCard(article) {
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
          .attr("href", article.url)
        .text(article.headline),
          $("<a class='btn btn-danger save'>Save Article</a>")
      )
    );

    var dataSum = article.summary
    var dataRep = dataSum.replace('Filed under:','');
    var cardBody = $("<div class='card-body'>").text(dataRep);

    card.append(cardHeader, cardBody);
    card.data("_id", article._id);
    return card;
  }

  function renderEmpty() {
    $("#noArticles").modal("toggle")
  };

  function handleArticleSave() {
    var articleToSave = $(this)
      .parents(".card")
      .data();

    $(this)
      .parents(".card")
      .remove();

    articleToSave.saved = true;
    $.ajax({
      method: "PUT",
      url: "/api/headlines/" + articleToSave._id,
      data: articleToSave
    }).then(function(data) {
      if (data) {
          location.reload();
      }
    });
  }

  function handleArticleScrape() {
    $.get("/api/fetch").then(function(data) {
      console.log(data)
      window.location.href = "/";
    });
  }

  function handleArticleClear() {
    $.get("api/clear").then(function(data) {
      console.log(data)
      articleContainer.empty();
      location.reload();
    });
  }
});