const express = require('express')

const app = express()
port = 7000

app.set('view engine', 'hbs')
app.use('/assets', express.static(__dirname + '/assets'))
app.use(express.urlencoded({ extended: false }))

const db = require('./connection/db')

let myProject = []

app.get('/', function (request, response) {


    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        client.query('SELECT * FROM tb_project ORDER BY id DESC', function (err, result) {
            if (err) throw err

            // console.log(result.rows)
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date)
                }
            })
            response.render('index', { myProject })
        })
    })
})

app.get('/form', function (request, response) {
    response.render('form')
})

app.get('/detail-project/:index', function (request, response) {
    let index = request.params.index

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(`SELECT * FROM tb_project WHERE id=${index}`, function (err, result) {
            if (err) throw err

            // console.log(result.rows)
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                }
            })
            response.render('detail-project', { project: myProject[0] })
        })
    })
})

app.get('/delete-project/:index', function (request, response) {
    let index = request.params.index

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `DELETE FROM tb_project WHERE id=${index}`

        client.query(query, function (err, result) {
            if (err) throw err

            response.redirect('/')
        })
    })
})


app.get('/add-project', function (request, response) {
    response.render('add-project')
})

app.post('/add-project', function (request, response) {
    // console.log(request.body);
    let name = request.body.inputName
    let startDate = request.body.inputStartDate
    let endDate = request.body.inputEndDate
    let message = request.body.exampleFormControlTextarea1
    let image = request.body.inputFile
    let check1 = request.body.check1
    let check2 = request.body.check2
    let check3 = request.body.check3
    let check4 = request.body.check4

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `INSERT INTO tb_project (name, start_date, end_date, description, technologies) VALUES
                ('${name}', '${startDate}', '${endDate}', '${message}','{"${check1}","${check2}","${check3}","${check4}"}')`

        client.query(query, function (err, result) {
            if (err) throw err

            // console.log(result.rows)
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                }
            })
            response.redirect('/')
        })
    })
})


app.get('/edit-project/:index', function (request, response) {
    let index = request.params.index

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `SELECT * FROM tb_project WHERE id='${index}'`

        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query

            let data = result.rows
            response.render('edit-project', { data: data[0] })
        })
    })
})

app.post('/edit-project/:index', function (request, response) {
    let index = request.params.index

    let name = request.body.inputName
    let startDate = request.body.inputStartDate
    let endDate = request.body.inputEndDate
    let message = request.body.exampleFormControlTextarea1
    let image = request.body.inputFile
    let check1 = request.body.check1
    let check2 = request.body.check2
    let check3 = request.body.check3
    let check4 = request.body.check4

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `UPDATE public.tb_project
                    SET  name='${name}', start_date='${startDate}', end_date='${endDate}', description='${message}',
                    technologies = '{${check1},${check2},${check3},${check4}}'
                    WHERE id ='${index}';`

        client.query(query, function (err, result) {
            if (err) throw err
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                }
            })

            response.redirect('/')
        })
    })

})

function getFullTime(time) {

    let month = ["Januari", "Febuari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let fullTime = `${date} ${month[monthIndex]} ${year}`
    return fullTime
}

function getDistanceTime(start, end) {
    let startDate = new Date(start)
    let endDate = new Date(end)

    let distance = endDate - startDate

    let milisecond = 1000
    let secondInHours = 3600
    let hoursInDay = 24

    let distanceDay = Math.floor(distance / (milisecond * secondInHours * hoursInDay))
    let distanceHours = Math.floor(distance / (milisecond * 60 * 60))
    let distanceMinutes = Math.floor(distance / (milisecond * 60))
    let distanceSeconds = Math.floor(distance / milisecond)

    return `${distanceDay} day`

}


app.listen(port, function () {
    console.log(`server running on port ${port}`);
})
