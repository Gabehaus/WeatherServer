import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import fetch from "node-fetch"

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json())

app.get("/", (req, res) => {
  res.send("API is running....")
})

app.post("/", async (req, res) => {
  try {
    //fetch data
    const apiResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${req.body.lat}&lon=${req.body.lon}&appid=abda353ccff55a728e4e3ebb219e641c&units=imperial`
    )

    //format data to json
    const apiResponseJson = await apiResponse.json()

    //get first three days of temperature data
    const threeDayData = apiResponseJson.list
      .slice(0, 24)
      .map((elem, i) => Math.round(elem.main.temp))

    //calc average
    const average = (threeDayData.reduce((a, b) => a + b) / threeDayData.length)
      .toFixed(1)
      .toString()

    //calc mode
    function getModes(array) {
      let frequency = {} // array of frequency.
      let maxFreq = 0 // holds the max frequency.
      let modes = []

      for (let i in array) {
        frequency[array[i]] = (frequency[array[i]] || 0) + 1 // increment frequency.

        if (frequency[array[i]] > maxFreq) {
          // is this frequency > max so far ?
          maxFreq = frequency[array[i]] // update max.
        }
      }

      for (var k in frequency) {
        if (frequency[k] == maxFreq) {
          modes.push(k)
        }
      }

      return modes
    }

    const modes = getModes(threeDayData)

    //calc median

    const arrSort = threeDayData.sort()
    const len = threeDayData.length
    const mid = Math.ceil(len / 2)

    const median =
      len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1]

    //send data
    res.send({ av: average, modes: modes.toString(), med: median.toString() })
  } catch (err) {
    console.log(err)
    res.status(500).send("Something went wrong")
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running on port ${PORT}`))
