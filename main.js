// api_key = YOUR_KEY
// top_headlines = https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_KEY

const API_KEY = 'YOUR_KEY'
let newsArray = []
let url = new URL(
  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
)
let menuSelect = document.querySelectorAll(".menu-bar button");
menuSelect.forEach(menus => menus.addEventListener("click", (event) => clickCategory(event)));

let page = 1;
// 한 페이지에 10개의 기사거리
let pageSize = 10;
// 페이지가 1~5까지
let groupSize = 5;


// data를 불러오고 render()하는 함수, seeNews와 clickCatergory, searchWithKeyword에 중복됨.
// status === 200 이면 The request was executed successfully 임.
let responseAndFetch = async () =>{
  try{
    // url 뒤에 &page=3 처럼 넣어줌.
    url.searchParams.set("page",page);
    url.searchParams.set("pageSize", pageSize);

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    
    // status가 200인거는 정상적으로 통과 된 것이므로, render()를 진행함.
    if (response.status === 200){
      // data.articles.length === 0이라는 건, 검색하거나, 카테고리를 눌렀을 때 기사의 내용이 0개라는 것임.
      // america를 검색했을 때, 기사가 하나도 없으면 0인 것임.
      if (data.articles.length === 0){
        throw new Error('There are no results matching your search word.')
      }
      newsArray = data.articles;
      totalResults = data.totalResults;
      render();
      paginationRender();
    }else{
      throw new Error(data.message);
    }
  }catch(errors){
    eRender(errors.message);
  }
}

// 처음에 헤드라인 뉴스들 보여줌 
let seeNews = async () => {
  url = new URL(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
  
  responseAndFetch();
}

// 카테고리 클릭했을 때, 이동
let clickCategory = async (event) => {
  let categoryName = event.target.textContent.toLowerCase();
  // console.log(categoryName);

  url = new URL(`https://newsapi.org/v2/top-headlines?country=us&category=${categoryName}&apiKey=${API_KEY}`);
  // 카테고리 클릭했을 때, 페이지 초기화
  page = 1;

  responseAndFetch();
}

// 키워드 검색 가능하게
let searchWithKeyword = async () => {
  let keyword = document.getElementById("search-input").value;
  
  if (!keyword){
    alert("Please enter a keyword");
    return;
  }

  url = new URL(`https://newsapi.org/v2/top-headlines?country=us&q=${keyword}&apiKey=${API_KEY}`)

  page = 1;
  
  responseAndFetch();

  document.getElementById("search-input").value = "";
}
// 엔터키 눌렀을 때도 동작하게끔
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key == "Enter"){
    searchWithKeyword();
  };
});

// html에 뉴스 창 띄워주는 함수
let render = () =>{
  let newsHTML = newsArray.map(news_detail =>
    `
      <div class="row news">
        <div class="col-lg-4 d-flex justify-content-center align-items-center">
          <img class="news-img" src="${news_detail.urlToImage || "images/no-image.jpg"}">
        </div>
        <div class="col-lg-8">
          <h2>
            <a href="${news_detail.url}">
              ${news_detail.title === "[Removed]"? "This news has been removed": (news_detail.title)}
            </a>
          </h2>
          <p>
            ${news_detail.description === "[Removed]"? "Removed Article" : (news_detail.description || "No description")}
          </p>
          <div>
            <b>${news_detail.source.name === "[Removed]"? "No source available" : (news_detail.source.name)}</b> · ${new Date(news_detail.publishedAt).toLocaleString("en-US")}
          </div>
        </div>
      </div>
    `
  ).join("");

  document.getElementById('main-news-part').innerHTML = newsHTML;
}

// error 났을 때, 에러 메세지 띄어주는 함수
let eRender = (eMessage) =>{
  errorHTML = `
    <div class="alert alert-warning" role="alert">
      ${eMessage}
    </div>
  `
  document.getElementById('main-news-part').innerHTML = errorHTML
}

let paginationRender = () => {
  // let page = 1;
  // let pageSize = 10;
  // let groupSize = 5;
  // 전체 페이지
  let totalPage = Math.ceil(totalResults/pageSize);
  // 현 페이지가 속한 페이지 그룹 (lastPage와 firstPage 구할려고)
  let pageGroup = Math.ceil(page/groupSize);
  let lastPage = pageGroup * groupSize;
  if (lastPage > totalPage){
    lastPage = totalPage;
  }
  let firstPage = lastPage - (groupSize - 1) <= 0? 1: lastPage - (groupSize - 1);

  let paginationHTML = ``


  // 첫 페이지로 이동
  if (page === 1){
    paginationHTML += `<li class="page-item disabled"><a class="page-link">First</a></li>`
  }else{
    paginationHTML += `<li class="page-item" onclick="movetoPage(${firstPage})"><a class="page-link">First</a></li>`
  }

  // page가 1보다 크면, previous를 클릭했을 때, 이전 페이지로 이동할 수 있음.
  // 아니면 클릭이 되지 않게 disabled
  if (page > 1){
    paginationHTML += `<li class="page-item" onclick = "movetoPage(${page-1})"><a class="page-link">Previous</a></li>`
  }else{
    paginationHTML += `<li class="page-item disabled"><a class="page-link">Previous</a></li>`
  }

  // 2페이지를 클릭하면, 2페이지가 active되고 page = 2가 movetoPage로 넘어가서 render를 해주게 됨.
  for (let i = firstPage; i <= lastPage; i++){
    paginationHTML += `<li class="page-item ${i===page? "active":""}"  onclick = "movetoPage(${i})"><a class="page-link">${i}</a></li>`
  }

  // page가 totalpage보다 작으면, next를 클릭했을 때, 다음 페이지로 이동할 수 있음.
  // 아니면 클릭이 되지 않게 disabled
  if (page < totalPage) {
    paginationHTML += `<li class="page-item" onclick = "movetoPage(${page+1})"><a class="page-link">Next</a></li>`
  }else{
    paginationHTML += `<li class="page-item disabled"><a class="page-link">Next</a></li>`
  }

  // 끝 페이지로 이동
  if (page === totalPage){
    paginationHTML += `<li class="page-item disabled"><a class="page-link">Last</a></li>`
  }else{
    paginationHTML += `<li class="page-item" onclick="movetoPage(${lastPage})"><a class="page-link">Last</a></li>`
  }

  document.querySelector(".pagination").innerHTML = paginationHTML;
}

let movetoPage = (num) =>{
  page = num;
  responseAndFetch();
}

// 로고 클릭했을 때, 뉴스 첫 화면으로 돌아가기
document.getElementById("logo").addEventListener("click", () => {
  seeNews();
})


seeNews();









