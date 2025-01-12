import { useEffect, useState } from 'react'
import './Overview.css'
import { getAllTracks, getNearText, measure } from '../../api/weaviate'
import Track from '../../components/Track/Track';
import { ITrack } from '../../interfaces/Track';
import Search from '../../components/Search/Search';
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer';
import TrackInfo from '../../components/TrackInfo/TrackInfo';

interface OverviewProps {
  token: string
}

function Overview(props:OverviewProps) {
  const { token } = props;
  const [tracks, setTracks] = useState<ITrack[]>([])
  const [selectedTrack, setSelectedTrack] = useState<ITrack | null>(tracks[0] || null)
  const [searchDuration, setSearchDuration] = useState<number>()
  // False := Search, True := QuestionSearch
  const [mode, setMode] = useState<boolean>(false)

  const handleSelectTrack = (track: ITrack) => {
    setSelectedTrack(track);
  }

  useEffect(() => {
    getAllTracks().then((newTracks) => setTracks(newTracks));
  }, [])
  const handleSearchChange = async(value: string) => {

    if(value === "" || !value) {
      return;
    }
    try {
      console.log("Searching for tracks similar to: ", value)
      const [newTracks, duration] = await measure(async() => await getNearText([value]));
      if (newTracks.length === 0 || !newTracks) {
        return;
      }
      setTracks(newTracks);
      setSearchDuration(duration);
    }
    catch(error) {
      console.log(error);
    }
  }

  return (
    <>
    <div className="header">
        <h1>Spotify Semantic Search</h1>
      </div> 
      <div className='search-bar'>
        <h3>Query tracks by their semantic lyric similarity to the search term</h3>
          <Search onChange={handleSearchChange} />
        </div>
      <span className='search-duration'>{searchDuration ? `${searchDuration}ms`: ""}</span>
    <div className='main'>
      <div className='overview'>
              <div className="grid-container">
              {tracks.map((track) => (
                <div className="grid-item">
                <Track key={track.track_id} token={token} onSelect={handleSelectTrack} track={track} selected={track.track_id === selectedTrack?.track_id}/>
                </div>
              ))}
          </div>
        </div>
        <div className='track-info_container'>
        {selectedTrack && <TrackInfo track={selectedTrack} token={token} onSelect={handleSelectTrack} />}
        </div>
      </div>
    {selectedTrack && <AudioPlayer track={selectedTrack}  token={token} />}
      
    </>
  )
}

export default Overview;