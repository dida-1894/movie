const rp =require('request-promise-native')

async function fetchMovie(item) {
    const url = `http://api.douban.com/v2/movie/subject/${item.doubanId}`

    const res = await rp(url)

    return res
}

(async () => {
    let movie = [
        {
            doubanId: 25849049,
            title: '超人总动员2',
            rate: 8,
            poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2522880251.jpg'
        },
        {
            doubanId: 26654269,
            title: '瞒天过海：美人计',
            rate: 6.7,
            poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2508259902.jpg'
        }
    ]
    movie.map(async movie => {
        let movieDate = await fetchMovie(movie)

        try {
            movieDate = JSON.parse(movieDate)
            console.log(movieDate.tags)
            console.log(movieDate.summary)
        } catch (e) {
            console.log(e)
        }
    })
})()