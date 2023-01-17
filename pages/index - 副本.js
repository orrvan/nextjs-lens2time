import React from 'react'
import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import { client, challenge, authenticate,defaultProfile,publications} from '../api'
import { id } from 'ethers/lib/utils'
// import { DefaultProfileDocument, DefaultProfileRequest } from '../graphql/generated';
function Header({headerProps}){
  // console.log(challenge)
  // console.log(headerProps)
  function switchBodyACollection(){
    // console.log(setbodyACollectionFlag)
    headerProps.setbodyACollectionFlag(true)
    headerProps.setbodyAExhibitionFlag(false)
  }
  function switchBodyAExhibition(){
    headerProps.setbodyACollectionFlag(false)
    headerProps.setbodyAExhibitionFlag(true)
  }
  // console.log(flag)
  /********************************************************身份验证登录开************************************************/
  const [address, setAddress] = React.useState()
  const [token, setToken] = React.useState()
  React.useEffect(()=>{
    console.log('UE1')
  /* when the app loads, check to see if the user has already connected their wallet */
    checkConnection()
  },[])
  /*********************************获取个人在LENS上的信息开*********************** */
  async function fetchProfile(){
    try {
      const defaultProfileInfo = await client.query({
        query:defaultProfile,
        variables: { address }
      })
      /*********************对象拷贝开 *************************************************************/
      let mydefalutProfile ={ ...defaultProfileInfo.data.defaultProfile}
      /*********************对象拷贝关 *************************************************************/
      /*****************************************对象解构赋值开************************************* */
      // const {data : {defaultProfile: { handle }}} = defaultProfileInfo
      /*****************************************对象解构赋值关************************************* */

      let picture = mydefalutProfile.picture
      if (picture && picture.original && picture.original.url) {
        if (picture.original.url.startsWith('ipfs://')) {
          let result = picture.original.url.substring(7, picture.original.url.length)
          mydefalutProfile.avatarUrl = `http://lens.infura-ipfs.io/ipfs/${result}`
        } else {
          mydefalutProfile.avatarUrl = picture.original.url
        }
      }
      console.log(mydefalutProfile)
      // console.log(picture)
      headerProps.setMyProfile(mydefalutProfile)
      /************获取个人在我们服务器上的信息 开 *******************************/
      let user =mydefalutProfile.name
      if(window.localStorage.getItem(user)){
        console.log('找到了用户')
      }else{
        let value =JSON.stringify({knapsackAll:[],knapsackUnselected:[],brochure:{}})
        window.localStorage.setItem(user,value)
        console.log('已新建用户')
      }
      /************获取个人在我们服务器上的信息 关 *******************************/
    } catch (err) {
      console.log({ err })
    }
  }
  /*********************************获取个人在LENS上的信息关*********************** */
  async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.listAccounts()
    if (accounts.length) {
      setAddress(accounts[0])
      // console.log(accounts)
    }
  }
  async function connect() {
    /* this allows the user to connect their wallet */
    const account = await window.ethereum.send('eth_requestAccounts')
    if (account.result.length) {
      setAddress(account.result[0])
      // console.log(address)
    }
  }
  async function login() {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address }
      })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(challengeInfo.data.challenge.text)
      /* authenticate the user */
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address, signature
        }
      })
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const { data: { authenticate: { accessToken }}} = authData
  
      console.log({ accessToken })
      setToken(accessToken)
      /*********************************获取个人在LENS上的信息开*********************** */
      fetchProfile()
      /*********************************获取个人在LENS上的信息关*********************** */
    } catch (err) {
      console.log('Error signing in: ', err)
    }
  }
  /********************************************************身份验证登录关***********************************************/  
   return(
    <div className={styles.header}>
      <div className={styles.h_blank1}></div>
      <div className={styles.h_menu}>
        <div className={styles.logo_Lenstime} >Lenstime</div>      
        <div className={styles.div_Collection}>
          <div onClick={switchBodyACollection}  className={headerProps.bodyACollectionFlag ? styles.btn_Collection : styles.btn_NotSelected_color}>Collection</div>
        </div>
        <div className={styles.div_Exhibition}>
          <div onClick={switchBodyAExhibition}  className={headerProps.bodyAExhibitionFlag ? styles.btn_Exhibition : styles.btn_NotSelected_color}>Exhibition</div>
        </div>
      </div>
      { /* if the user has not yet connected their wallet, show a connect button */ }
      {
        !address && <div onClick={connect} className={styles.h_login}>Connect</div>
      }
      { /* if the user has connected their wallet but has not yet authenticated, show them a login button */ }
      {
        address && !token && <div onClick={login} className={styles.h_login}>Login</div>
      }
      { /* once the user has authenticated, show them a success message */ }
      {
        address && token && headerProps.myProfile && <div className={styles.h_avatarUrl}>
          <img src={ headerProps.myProfile.avatarUrl || 'https://picsum.photos/200'} />
        </div>
      }
      <div className={styles.h_blank2}></div>
    </div>
  )
}
function BodyACollection({bodyACollectionProps},){
  // console.log(3)
  function creatBrochure(){
    console.log('creatBrochure')
    bodyACollectionProps.setaddCollectionComponentFlag(true)
    fetchPublications(0)
  }
  /****************************将我们服务器中的未选中图片数组绘制到前端  开 */
  async function drawKnapsackUnselected(){
    console.log('正在绘制')
  }
  /****************************将我们服务器中的未选中图片数组绘制到前端  关 */
  /****************获取个人在我们服务器的背包 开*********************************** */
  async function fetchKnapsack(props){
    if(window.localStorage.getItem(bodyACollectionProps.myProfile.name)){
      let data=JSON.parse(window.localStorage.getItem(bodyACollectionProps.myProfile.name))
      console.log(data)
        if(data.knapsackAll.length>0 && props.length>0 ){
          console.log('用户全背包图片不为空')
          let knapsackAllLength = data.knapsackAll.length
          let propsLength =props.length
          let tempArr=[]
          jump:for(let i=0;i<propsLength;i++){
                  for(let j=0;j<knapsackAllLength;j++){
                    if(props[i].id === data.knapsackAll[j].id){
                      console.log('我们服务器全背包已经存了用户最新的图片')
                      break jump
                    }else{
                      console.log('目前没找到一样的'+j)
                      if(j==knapsackAllLength-1){
                        tempArr.push(props[i])
                      }
                      else{
                        continue
                      }
                    }
                  }  
          }
          drawKnapsackUnselected()
        }else{
          console.log('用户的全图片背包为空')
          data.knapsackAll=props
          data.knapsackUnselected=props
          window.localStorage.setItem(bodyACollectionProps.myProfile.name,JSON.stringify(data))
          // bodyACollectionProps.setKnapsackUnselected(props)
          drawKnapsackUnselected()
        }
    }else{
      console.log('请先登录/未找到该用户')
    }
  }
  /****************获取个人在我们服务器上的背包 关*********************************** */
  /****************获取个人在LENS上的的出版物 开*********************************** */
  async function fetchPublications(index){
    // console.log(bodyACollectionProps.myProfile.id)
    // const profileId =bodyACollectionProps.myProfile.id || null
    if(bodyACollectionProps.myProfile){
      try {
        const profileId= bodyACollectionProps.myProfile.id
        const userPublications = await client.query({
          query:publications,
          //bodyACollectionProps.cursor[index]
          variables:{id:profileId,limit:12,publicationTypes:['POST','MIRROR'],cursor:null}
        })
        let myPublications ={ ...userPublications.data.publications}
        console.log(myPublications)
        bodyACollectionProps.setCursor([myPublications.pageInfo.prev,myPublications.pageInfo.next])
        console.log(bodyACollectionProps.cursor)
        // bodyACollectionProps.setCursor([myPublications.pageInfo.prev,myPublications.pageInfo.next])
        // console.log(bodyACollectionProps.cursor)
        /*****通过Promise.all 和map函数 重新得到一个数组publicationsData 开************/
        let publicationsData = await Promise.all(myPublications.items.map(async publicationInfo => {
          let publish = {}
          publish.id=publicationInfo.id
          let pictures =publicationInfo.metadata.media
          console.log(pictures)
          publish.imgUrl=[]
          for(let i=0;i<pictures.length;i++){
            if (pictures[i] && pictures[i].original && pictures[i].original.url) {
              if (pictures[i].original.url.startsWith('ipfs://')) {
                let result = pictures[i].original.url.substring(7, pictures[i].original.url.length)
                publish.imgUrl.push(`http://lens.infura-ipfs.io/ipfs/${result}`)
              } else {
                publish.imgUrl.push(pictures[i].original.url) 
              }
            }
          }
          return publish
        }))
        console.log(publicationsData)
        // fetchKnapsack(publicationsData)
        /*****通过Promise.all 和map函数 重新得到一个数组publicationsData 关*************/
      } catch (err) {
        console.log({ err })
      }
    }else{
      console.log('请先登录')
    }
  }
  /*****************获取个人在LENS上的的出版物 关*********************************** */
  return(
  <div className={styles.bodyACollection}>
      <div className={styles.collectionSlogan}>Use Lenstime now to create your own brochure</div>
      <div className={styles.collectionDomain}>
        <div onClick={creatBrochure} className={styles.collectionAdd}>Create  Brochure</div>
      </div>  
  </div>
  )
}
function BodyAExhibition({bodyAExhibitionFlag}){
  // console.log(4)
    return(
      <div className={styles.bodyAExhibition}>
        <div className={styles.collectionSlogan}>Use Lenstime now to create your solo exhibition</div>
        <div className={styles.collectionDomain}>
          <div className={styles.collectionAdd}>Create  Exhibition</div>
        </div>   
      </div>
    )
}
function BodyBCollectionBlank(){
  // console.log(5)
    return(
      <div className={styles.bodyBCollectionBlank}>
        <div className={styles.collectionBlankBg}></div>
        <div className={styles.collectionBlankFont}>Your personal collection has not been classified yet</div>
      </div>
      )
}
function AddCollectionComponent({addCollectionComponentProps}){
  function cancelPrompt(){
    console.log('cancel')
  }
  function cancelCreatBrochure(e){
    e.stopPropagation() //阻止冒泡事件
    console.log('cancelCreatBrochure')
    addCollectionComponentProps.setaddCollectionComponentFlag(false)
  }
  function startDraw(){
    console.log('UEDRAW')
  }
  return(
    <div onClick={cancelPrompt} className={styles.addCollectionContainer}>
      <div onClick={cancelCreatBrochure} className={styles.addCollectionView}></div>
      <div className={styles.addCollectionKnapsack}></div>
    </div>
  )
}
function BodyBExhibitionBlank(){
  // console.log(7)
    return(
      <div className={styles.bodyBExhibitionBlank}>
        <div className={styles.exhibitionBlankBg}></div>
        <div className={styles.exhibitionBlankFont}>Your solo exhibition is still in your mind</div>
      </div>
      )
}
function BodyBCollectionFull(){
  // console.log(6)
    return(
        <div className={styles.bodyBCollectionFull}></div>
      )
}
function BodyBExhibitionFull(){
  // console.log(8)
    return(
        <div className={styles.bodyBExhibitionFull}></div>
      )
}

export default function Home() {
  // console.log(0)
  const [width, setWidth] = React.useState(0)
  const [bodyACollectionFlag, setbodyACollectionFlag] = React.useState(true) 
  const [bodyAExhibitionFlag, setbodyAExhibitionFlag] = React.useState(false) 
  const [bodyBCollectionBlankFlag, setbodyBCollectionBlankFlag] = React.useState(true) 
  const [bodyBExhibitionBlankFlag, setbodyBExhibitionBlankFlag] = React.useState(true)
  const [addCollectionComponentFlag,setaddCollectionComponentFlag] =React.useState(false)
  /*********************************获取个人在LENS上的信息开*********************** */
  const [myProfile,setMyProfile] =React.useState()
  /*********************************获取个人在LENS上的信息关*********************** */
  /***************************获取个人在LENS上的出版物 开******************************/
  const [cursor,setCursor] = React.useState([null,null])
   /***************************获取个人在LENS上的出版物 关******************************/
  /*********************************获取用户在我们数据库的背包数组 全图片背包，未选择背包 和图册对象 开*** */
  const [knapsackAll,setKnapsackAll] =React.useState([])
  const [knapsackUnselected,setKnapsackUnselected] =React.useState([])
  /*********************************获取用户在我们数据库的背包数组（全图片背包，未选择背包 和图册对象 关*** */
  React.useEffect(() => {
    console.log('UE0')
    /**********************************************根据窗口尺寸来调整html根元素fontsize************************************* **/
    const handleResize = () => {
      setWidth(window.innerWidth);
    }
    // setbodyACollectionFlag(false)
    var fz = window.innerWidth / (1440/28)
    if(fz<16){
      fz=16
    }
    if(fz>28){
      fz=28
    }
    // console.log(fz)
    document.documentElement.style.fontSize = fz+'px'
    // window.addEventListener('resize', handleResize)
    // return () => window.removeEventListener('resize', handleResize);
    /***********************************************根据窗口尺寸来调整html根元素fontsize ********************************************/
  }, [])
  return (
  <div className={styles.container}>
    <Header headerProps={{bodyACollectionFlag,bodyAExhibitionFlag,setbodyACollectionFlag,setbodyAExhibitionFlag,myProfile,setMyProfile}}></Header>
    {bodyACollectionFlag == true && <BodyACollection bodyACollectionProps={{setaddCollectionComponentFlag,myProfile,setMyProfile,cursor,setCursor,knapsackUnselected,setKnapsackUnselected}}></BodyACollection>
    }
    {
      bodyAExhibitionFlag == true && <BodyAExhibition></BodyAExhibition>
    }
    {
      bodyACollectionFlag == true && bodyBCollectionBlankFlag == true && !addCollectionComponentFlag && <BodyBCollectionBlank></BodyBCollectionBlank>
    }
    {
      addCollectionComponentFlag == true && <AddCollectionComponent addCollectionComponentProps={{setaddCollectionComponentFlag}} ></AddCollectionComponent>
    }
    {
      bodyACollectionFlag == true && bodyBCollectionBlankFlag == false && <BodyBCollectionFull></BodyBCollectionFull>
    }
    {
      bodyAExhibitionFlag == true && bodyBExhibitionBlankFlag == true && <BodyBExhibitionBlank></BodyBExhibitionBlank>
    }
    {
       bodyAExhibitionFlag == true && bodyBExhibitionBlankFlag == false && <BodyBExhibitionFull></BodyBExhibitionFull>
    }
    
  </div>
  )
}
