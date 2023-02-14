import { useState, useEffect,useRef} from 'react'
import styles from '../styles/HomePage.module.css'
import Link from 'next/link'
export default function Home({data}) {
  const[allBrochures,setAllBrochures] = useState([])
  const [address, setAddress] = useState()
  const [clickIndexFlag,setClickIndexFlag]=useState([true,false,false])
  useEffect(() => {
    if (data) {
      var fz = window.innerWidth / (1440/28)
      if(fz<16){
        fz=16
      }
      if(fz>28){
        fz=28
      }
      document.documentElement.style.fontSize = fz+'px'
    }
    fetchAllBrochures()
  }, [data])
  async function fetchAllBrochures(){
    let tempAllbrochures =[]
    data.data.map((user)=>{
      // console.log(user)
      let dataParse =JSON.parse(user.data)
      let brochures = dataParse.brochures
      tempAllbrochures=tempAllbrochures.concat(brochures)
      // console.log(brochures)
    })
    console.log(tempAllbrochures)
    setAllBrochures(tempAllbrochures)
  }
  if (!data) return null
  return(
  <div className={styles.container}>
    <div className={styles.header}>
      <div className={styles.logo_LensView}>Lenstime</div>
      <div className={styles.options}>
        {clickIndexFlag[0] && <div style={{width:"48.25%",color:'rgba(0, 0, 0, 1)',borderRight:'1px solid rgba(187,187,187,0.5)'}}>Recommendation</div>} 
        {clickIndexFlag[1] && <div style={{width:'28.5%' ,color:'rgba(0, 0, 0, 1)',borderRight:'1px solid rgba(187,187,187,0.5)'}}>Interests</div>}        
        {clickIndexFlag[2] &&<div style={{width:'23.25%',color:'rgba(0, 0, 0, 1)'}}>Create</div>}
        {!clickIndexFlag[0] && <div style={{width:"48.25%",color:'rgba(190, 190, 190, 1)',borderRight:'1px solid rgba(187,187,187,0.5)'}}>Recommendation</div>} 
        {!clickIndexFlag[1] && <div style={{width:'28.5%' ,color:'rgba(190, 190, 190, 1)', borderRight:'1px solid rgba(187,187,187,0.5)'}}>Interests</div>}        
        {!clickIndexFlag[2] &&<div style={{width:'23.25%',color:'rgba(190, 190, 190, 1)'}}>Magic</div>}
      </div>
      <div></div>
      <div className={styles.search}>
        <div className={styles.searchIcon}></div>
        <input style={{border:'none',backgroundColor:'rgba(245, 245, 245, 1)',height:'32px',outline:'none',width:'80%'}}></input>
      </div>
      {/* <Link className={styles.myHome} target="_blank" style={{width:'6.1rem',height:'6.1rem',position:'absolute'}} href={``}>
      
      </Link> */}
      <div className={styles.myHome}>
        <Link style={{width:'100%'}}  target="_blank"  href={``}> I have a lens handle </Link>
        {/* <p style={{fontSize:'0.7rem',lineHeight:'41px'}}>I have a lens handle</p> */}
        <div className={styles.remind}></div>
        {
        address && token && headerProps.myProfile && <div className={styles.h_avatarUrl}>
          <img src={ headerProps.myProfile.avatarUrl} alt={'当前网络不可用'} />
        </div>
        }
        <div className={styles.myHomeBtn}></div>
      </div>
    </div>
    <div className={styles.body1}>
      <div className={styles.body1Control}></div>
    </div>
    <div className={styles.body2}>
    {
      allBrochures.map((brochureItem,brochureIndex) =>{
        return <div key={brochureIndex} className={styles.brochureItem}>
                <div className={styles.brochureBg}>
                  <img className={styles.brochureImg} src={brochureItem.brochure[0].src}></img>
                  <Link target="_blank" style={{width:'6.1rem',height:'6.1rem',position:'absolute'}} href={`/atlas/${brochureItem.id}`}></Link>
                </div>
                <div className={styles.brochureArea}>
                  <div>
                  {brochureItem.brochureName}
                  </div>
                  <div className={styles.brochureContral}>
                    <div onClick={(e) =>{}}  className={styles.brochureContralView}></div>                      
                    {/* <div onClick={(e) =>{brochureDelete(e,brochureItem,brochureIndex)}}  className={styles.brochureContralDel}></div>
                    <div onClick={(e) =>{brochureEdit(e,brochureItem,brochureIndex)}}  className={styles.brochureContralEdit}></div> */}
                    <div className={styles.brochureMediaShare}></div>
                  </div>
                </div>
        </div>
      })
    }
    </div>
  </div>
  )
}
export async function getServerSideProps(context){
  const id  = 'welcome to home'
  const res = await fetch(`${process.env.API_SEARCH_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'allUsers',
    }),
  });
  const data = await res.json() 
  return{
    props:{
      data:data,
    }
  }
}