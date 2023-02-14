import React, { useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import { client, challenge, authenticate,defaultProfile,publications,collections} from '../api'
import Link from 'next/link'
// import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
// import { Resizable } from 'react-resizable';
// import { ResizableBox } from 'react-resizable';
// import Link from 'next/link';
// import Image from 'next/image'
// import { id } from 'ethers/lib/utils'
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
    headerProps.setaddCollectionComponentFlag(false)
  }
  // console.log(flag)
  /********************************************************身份验证登录开************************************************/
  const [address, setAddress] = React.useState()
  const [token, setToken] = React.useState()

  React.useEffect(()=>{
    // console.log('UE1')
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
      // console.log(defaultProfileInfo)
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
      
      let user =mydefalutProfile.handle
      //用户加载的loading可以在这里设计
      headerProps.setLoadingFlag(true)
      const searchData = await headerProps.searchUser(user)
      headerProps.setLoadingFlag(false)
      console.log(user)
      console.log()
      if(searchData.data){
        if(searchData.data.length>0){
          console.log('找到了用户')
          let data = JSON.parse(searchData.data[0].data)
          if(data.brochures.length>0){
            console.log('用户有已创建的册子,现在将用户的册子展示在我们网站中')
            let temArr=[].concat(data.brochures)
            headerProps.setMyBrochures(temArr)
            headerProps.setbodyBCollectionBlankFlag(false)
          }else{
            console.log('用户现在还没有册子')
          }
        }else{
          let value =JSON.stringify({
          brochures:[]})
          headerProps.setLoadingFlag(true)
          headerProps.createUser(user,value)
          // window.localStorage.setItem(user,value)
          console.log('已新建用户')
        }
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
  
      // console.log({ accessToken })
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
          <img src={ headerProps.myProfile.avatarUrl} alt={'当前网络不可用'} />
        </div>
      }
      <div className={styles.h_blank2}></div>
    </div>
  )
}
function BodyACollection({bodyACollectionProps}){
  useEffect(() =>{},[])
  // console.log(3)
  function creatBrochure(){
    // console.log('正在创建册子')
    bodyACollectionProps.brochureSelected.current={brochure:[],brochureTag:[]}
    bodyACollectionProps.setaddCollectionComponentFlag(true)
    bodyACollectionProps.setAddOrEditCollectionComponentFlag(true)
  }
  return(
  <div className={styles.bodyACollection}>
      <div className={styles.collectionSlogan}>Use Lenstime now to create your own brochure</div>
      <div className={styles.collectionDomain}>
        <div onClick={creatBrochure} className={styles.collectionAdd}></div>
        <div  className={styles.movieAdd}></div>
        <div  className={styles.musicAdd}></div>
      </div>  
  </div>
  )
}
function BodyAExhibition({bodyAExhibitionProps}){
  // console.log(4)
  function createExhibition(){
    console.log('正在创建展览')
    bodyAExhibitionProps.setbodyAExhibitionFlag(false)
    bodyAExhibitionProps.setaddExhibitionComponentFlag(true)
  }
    return(
      <div className={styles.bodyAExhibition}>
        <div className={styles.collectionSlogan}>Use Lenstime now to create your solo exhibition</div>
        <div className={styles.collectionDomain}>
          <div className={styles.collectionAdd}>COMING  SOON</div>
          {/* <div onClick={createExhibition} className={styles.collectionAdd}>Create  Exhibition</div> */}
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
  /*****************************用来绘制背包图片1的数组*************************/
  const [knapsackPictures,setKnapsackPictures] =React.useState([])
   /*****************************用来绘制背包图片2的数组*************************/
  const [knapsackPictures2,setKnapsackPictures2] =React.useState([])
  /*****************************用来绘制背包里所有帖子图片的数组 *************************/
  const dataRef =React.useRef({cursor:[null,null],pictures:[]})
  /*****************************用来绘制背包里所有收藏品图片的数组 *************************/
  const dataRefCollections =React.useRef({cursor:[null,null],pictures:[]})

  const noImage="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' viewBox='0 0 700 475'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage preserveAspectRatio='none' filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' href='data:image/svg+xml;base64,CiAgPHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iMjAlIiAvPgogICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyMjIiIG9mZnNldD0iNTAlIiAvPgogICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPHJlY3Qgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9IiMzMzMiIC8+CiAgICA8cmVjdCBpZD0iciIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9InVybCgjZykiIC8+CiAgICA8YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTcwMCIgdG89IjcwMCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiICAvPgogIDwvc3ZnPg=='/%3E%3C/svg%3E"
  const [brochure,setBrochure] =React.useState(addCollectionComponentProps.brochureSelected.current.brochure)
  // const [brochure,setBrochure] =React.useState([])
  /****************用来控制用户到底能不能继续装载POST或者Collections，如果用户总帖子少于12条，那么无需再装载，如何用户装计载计数器大于5次，图片还是小于12张，也无需再加载************************ */
  const reloadCount =React.useRef(0)
  const reloadCollectionsCount =React.useRef(0)
  //*************如果用户本来帖子就很少，或者帖子已经被fetch完毕，那么允许用户在少于12张图片的情况下绘制背包********/
  const fetchPubFlag =React.useRef(true)
  const fetchColFlag =React.useRef(true)
  /*********用来收集创建册子的表单数据 ******************************/
  const dataCreateBrochure =React.useRef({
    brochureName:addCollectionComponentProps.brochureSelected.current.brochureName,
    brochureTag:addCollectionComponentProps.brochureSelected.current.brochureTag,
    brochure:[],
    brochureName:addCollectionComponentProps.brochureSelected.current.likes,
    brochureName:addCollectionComponentProps.brochureSelected.current.content,
    brochureName:addCollectionComponentProps.brochureSelected.current.slots,
    brochureName:addCollectionComponentProps.brochureSelected.current.bgImg,
    brochureName:addCollectionComponentProps.brochureSelected.current.views,
    brochureName:addCollectionComponentProps.brochureSelected.current.id
  })

  /********pageIndex和pageIndex2 分别用来存储俩个背包在对应页数下的的NFT展示 都是从第0页开始 */
  var [pageIndex,setPageIndex] =React.useState(0)
  var [pageIndex2,setPageIndex2] =React.useState(0)
  var pageEnd =React.useRef(99999)
  var pageEnd2 =React.useRef(99999)
  var [knapsackSelection,setKnapsackSelection] =React.useState(1)
  var [turnRightFlag,setTurnRightFlag] =React.useState(true)
  var [turnRight2Flag,setTurnRight2Flag] =React.useState(true)

  /****当图片不足以绘制的时候，需要一定的时间来重新填充LENS的帖子，然后填充背包，所以希望此时用户不要点击翻页 */
  const [pageFlag,setPageFlag] =React.useState(true)
  const [pageFlag2,setPageFlag2] =React.useState(true)
  // const index =React.useRef(0)
  // console.log(index)
  // console.log(indexRef)
  /**************切换背包时候的状态变化 */
  const [postFlag,setPostFlag] =React.useState(true)
  const [collectionFlag,setCollectionFlag] =React.useState(false)
  /****************************** */
  function cancelPrompt(){
    console.log('cancel')
  }
  function cancelCreatBrochure(e){
    e.stopPropagation() //阻止冒泡事件
    console.log('cancelCreatBrochure')
    addCollectionComponentProps.setaddCollectionComponentFlag(false)
    setKnapsackPictures([])
  }
  useEffect(() =>{
    console.log('你已经打开了背包界面')
    fetchPublications(0)
    //第一步首先装填出版物并生成所含所有图片的数组，并保存至dataRef.current.pictures
    fetchCollections(0)
    //第一步首先装填收藏品并生成所含所有图片的数组，并保存至dataRefCollections.current.pictures
  },[addCollectionComponentProps.addCollectionComponentFlag])
  /********************************装填出版物，获取个人在LENS服务器上的帖子，并生成数组****************************************/
  //这里的index用来表示，是重置出版物，还是获取下一个出版物，index 值为0或者1,0表示重置，重新装填一遍。1表示获取下次出版物并装填
  async function fetchPublications(index){
    console.log(addCollectionComponentProps.myProfile)
    addCollectionComponentProps.setLoadingFlag(true)
    if(addCollectionComponentProps.myProfile){
      try {
        const profileId= addCollectionComponentProps.myProfile.id
        const userPublications = await client.query({
          query:publications,
          variables:{id:profileId,limit:12,publicationTypes:['POST','MIRROR'],cursor:dataRef.current.cursor[index]}
        })
        let myPublications ={ ...userPublications.data.publications}
        /******如果用户本次fetch的帖子小于12，说明用户没有更多帖子了，需要将fetch的开关关闭 */
     
        console.log(myPublications)
        if(myPublications.items.length<12){
          console.log('用户没有更多帖子了')
          fetchPubFlag.current=false
        }
        dataRef.current.cursor = [myPublications.pageInfo.prev,myPublications.pageInfo.next]
        // console.log(dataRef)
        /*****通过Promise.all 和map函数 重新得到一个简化过滤后的 帖子数组 publicationsData，将LENS服务器上不可读的图片地址转换成https图片地址 开************/
        let publicationsData = await Promise.all(myPublications.items.map(async publicationInfo => {
          let publish = {}
          publish.id=publicationInfo.id
          let pictures =publicationInfo.metadata.media
          // console.log(pictures)
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
        // console.log(publicationsData)
        /*****通过Promise.all 和map函数 重新得到一个简化过滤后的 帖子数组 publicationsData 将LENS服务器上不可读的图片地址转换成https图片地址 关*************/
        /*****通过map函数 得到一个 非帖子 纯图片数组publicationsPictures 开*************/
        let publicationsPictures=[]
        publicationsData.map(post =>{
          for(let i=0;i<post.imgUrl.length;i++){
            let temObj={}
            temObj.src=post.imgUrl[i]
            temObj.id =post.id
            temObj.state=[0,0,0]//一开始默认设计三个状态，第一个状态用于判断图片是否被选中
            publicationsPictures.push(temObj)
          }
        })
         /*****通过map函数 得到一个 非帖子 纯图片数组publicationsPictures 关*************/
         /*******如果index == 1  fetchPublications(1)那么出版物数组将被连更，否则用fetchPublications(0)，出版物将被重置*/       
        if(index == 1){
          let temparr=dataRef.current.pictures.concat(publicationsPictures)
          dataRef.current.pictures=temparr
        }else{
          dataRef.current.pictures=publicationsPictures
        }
        console.log(dataRef.current.pictures)
        //第二步装填第一种类型背包1，出版物相关图片：
        fetchKnapsack(1) 

        //需要1 查重，检查第一步得到的图片中，有没有已经添加至我们服务器图册中的，如果有，将不显示在背包里。
        //需要2 判断查重后的图片数量，是否还能满足12张，用于渲染到网页中，如不满足，则再次装填出版物，并走到这一步
      } catch (err) {
        console.log({ err })
      }
    }else{
      alert('请先登录')
      addCollectionComponentProps.setLoadingFlag(false)
    }
  }
  /****************获取个人在LENS服务器上的所有收藏品，并生成图片数组 *******************************/
  async function fetchCollections(index){
    console.log('正在装在收藏品')
    addCollectionComponentProps.setLoadingFlag(true)
    if(addCollectionComponentProps.myProfile){
      try {
        const address= addCollectionComponentProps.myProfile.ownedBy
        // console.log(address)
        const userCollections = await client.query({
          query:collections,
          variables:{address:address,limit:12,publicationTypes:['POST'],cursor:dataRefCollections.current.cursor[index]}
        })
        let myCollections ={ ...userCollections.data.publications}
        if(myCollections.items.length<12){
          console.log('用户没有更多收藏了')
          fetchColFlag.current=false
        }
        dataRefCollections.current.cursor = [myCollections.pageInfo.prev,myCollections.pageInfo.next]
        // console.log(dataRefCollections.current.cursor)
        // console.log(myCollections.pageInfo.prev)
        // console.log(myCollections.pageInfo.next)
        let collectionsData = await Promise.all(myCollections.items.map(async collectionInfo => {
          let collection = {}
          collection.id=collectionInfo.id
          let pictures =collectionInfo.metadata.media
          collection.imgUrl=[]
          for(let i=0;i<pictures.length;i++){
            if (pictures[i] && pictures[i].original && pictures[i].original.url) {
              if (pictures[i].original.url.startsWith('ipfs://')) {
                let result = pictures[i].original.url.substring(7, pictures[i].original.url.length)
                collection.imgUrl.push(`http://lens.infura-ipfs.io/ipfs/${result}`)
              } else {
                collection.imgUrl.push(pictures[i].original.url) 
              }
            }
          }
          return collection
        }))
        // console.log(collectionsData)
        let collectionsPictures=[]
        collectionsData.map(post =>{
          for(let i=0;i<post.imgUrl.length;i++){
            let temObj={}
            temObj.src=post.imgUrl[i]
            temObj.id =post.id
            temObj.state=[0,0,0]//一开始默认设计三个状态，第一个状态用于判断图片是否被选中
            collectionsPictures.push(temObj)
          }
        })
        // console.log(collectionsPictures)   
        if(index == 1){
          let temparr=dataRefCollections.current.pictures.concat(collectionsPictures)
          dataRefCollections.current.pictures=temparr
        }else{
          dataRefCollections.current.pictures=collectionsPictures
        }
        console.log(dataRefCollections.current.pictures)
        fetchKnapsack(2)   //填充背包类型2，所有收藏品的背包
      } catch (err) {
        console.log({ err })
      }
    }else{
      alert('请先登录')
      addCollectionComponentProps.setLoadingFlag(false)
    }
  }
  /******************装填背包，获取个人在我们服务器上建立相册已用过的图片，然后查重，最后绘制背包图片 */
  async function fetchKnapsack(knapsackIndex){
      // console.log('正在装填背包图片')
      let pictures
      if(knapsackIndex == 1){
        pictures=dataRef.current.pictures
      }else{
        pictures=dataRefCollections.current.pictures
      }
      // console.log(pictures[0].src)

      const searchData = await addCollectionComponentProps.searchUser(addCollectionComponentProps.myProfile.handle)
      // addCollectionComponentProps.setLoadingFlag(false)
      if(searchData.data.length>0){
        // console.log('找到了用户')
        // console.log(searchData)
        let data = JSON.parse(searchData.data[0].data)
        // console.log(data)
        /********图片是否被选中过处理函数 */
        let imgAllBeUsed =[]
        data.brochures.map(brochureItem =>{
          brochureItem.brochure.map(picture =>{
            imgAllBeUsed.push(picture.src)
          })
        })
        // console.log(imgAllBeUsed)
        let imgAllBeUseLength =imgAllBeUsed.length
        /********图片是否被选中过处理函数 */
          if(imgAllBeUseLength >0 && pictures.length > 0 ){
            // console.log('用户创建过图册')
              for(let i=0;i<pictures.length;i++){
                for(let j=0;j<imgAllBeUseLength;j++){
                    // console.log(pictures[i].src)
                    if(imgAllBeUsed[j] == pictures[i].src){
                      // console.log('该图片已存在')
                      pictures.splice(i,1)
                      i--
                      break
                    }else{
                      // console.log('该图片不存在')
                    }
                }
              }
              if(pictures.length >= 12){
                  reloadCount.current =0
                  reloadCollectionsCount.current =0
                // console.log('图片数量满足绘制001')
                addCollectionComponentProps.setLoadingFlag(false)
                if(knapsackIndex == 1 ){
                  drawKnapsack(1)
                  setPageFlag(true)
                }else{
                  drawKnapsack(2)
                  setPageFlag2(true)
                }
                // console.log(pictures)
              }else{
                // console.log('图片数量不满足绘制，需要重新装填出版物002')
                if(reloadCount.current>5){
                  console.log('图片数量不满足绘制 POST 003') 
                  addCollectionComponentProps.setLoadingFlag(false)
                  return false
                }
                if(reloadCollectionsCount.current>5){
                  console.log('图片数量不满足绘制 Collection 003') 
                  addCollectionComponentProps.setLoadingFlag(false)
                  return false
                }
                if(knapsackIndex == 1){
                  if(fetchPubFlag.current == false){
                    addCollectionComponentProps.setLoadingFlag(false)
                    drawKnapsack(1)
                    setPageFlag(true)
                  }else{
                    fetchPublications(1)
                    setPageFlag(false)
                    reloadCount.current ++
                  }
                }else{
                  if(fetchColFlag.current == false){
                    addCollectionComponentProps.setLoadingFlag(false)
                    drawKnapsack(2)
                    setPageFlag2(true)
                  }else{
                    fetchCollections(1)
                    setPageFlag2(false)
                    reloadCollectionsCount.current ++
                  }
                }
              }
          }else{
            console.log('用户未创建过图册')
            if(pictures.length >= 12){
              reloadCount.current =0
              reloadCollectionsCount.current = 0
              console.log('图片数量满足绘制004')
              addCollectionComponentProps.setLoadingFlag(false)
              if(knapsackIndex == 1){
                setPageFlag(true)
                drawKnapsack(1)
              }else{
                setPageFlag2(true)
                drawKnapsack(2) 
              }
              console.log(pictures)
            }else{
              // console.log(reloadCollectionsCount)
              // console.log('图片数量不满足绘制,需要重新装填出版物005')
              if(reloadCount.current>5){
                // alert('图片数量不满足绘制005') 
                console.log('装填次数太多依旧不满足POST') 
                addCollectionComponentProps.setLoadingFlag(false)
                return false
              }
              if(reloadCollectionsCount.current>5){
                // alert('图片数量不满足绘制005') 
                console.log('装填次数太多依旧不满足 Collection') 
                addCollectionComponentProps.setLoadingFlag(false)
                return false
              }
              if(knapsackIndex == 1){
                if(fetchPubFlag.current == false){
                  addCollectionComponentProps.setLoadingFlag(false)
                  drawKnapsack(1)
                  setPageFlag(true)
                }else{
                  fetchPublications(1)
                  reloadCount.current ++
                }
              }else{
                if(fetchColFlag.current == false){
                  addCollectionComponentProps.setLoadingFlag(false)
                  drawKnapsack(2)
                  setPageFlag2(true)
                }else{
                  fetchCollections(1)
                  reloadCollectionsCount.current ++
                }
              }
            }
          }
      }else{
        alert('请先登录/未找到该用户')
      }
    }

  function drawKnapsack(knapsackIndex){
    let pictures
    let temparr
    let temIndex
    if(knapsackIndex == 1){
      pictures=dataRef.current.pictures
      temparr =[].concat(knapsackPictures)
      temIndex =pageIndex
    }else{
      pictures=dataRefCollections.current.pictures
      temparr =[].concat(knapsackPictures2)
      temIndex =pageIndex2
    }
    // console.log(temparr[index.current])
    if(temparr[temIndex]){
      // console.log('当前数组有内容')
      if(knapsackIndex == 1){
        setPageIndex(temIndex)
      }else{
        setPageIndex2(temIndex)
      }
 
    }else{
      console.log(pictures)
      // console.log('当前数组无内容')
      if(pictures.length >= 12){
        let groupA =pictures.splice(0,4)
        let groupB =pictures.splice(0,4)
        let groupC =pictures.splice(0,4)
        temparr[temIndex]=[groupA,groupB,groupC]
        // console.log(temparr.length)
        // console.log(pictures)
        // console.log('缓存数组图片大于12张,正在制作并绘制背包的12张图片006')
        // console.log(temparr)
        if(knapsackIndex == 1){
          setKnapsackPictures(temparr)
          setPageIndex(temIndex)
        }else{
          setKnapsackPictures2(temparr)
          setPageIndex2(temIndex)
        }
      }else{
        console.log('图片不足以制作并绘制007')
        let groupA =pictures.splice(0,4)
        let groupB =pictures.splice(0,4)
        let groupC =pictures.splice(0,4)
        temparr[temIndex]=[groupA,groupB,groupC]
        if(knapsackIndex == 1){
          if(fetchPubFlag.current == false){
            console.log('绘制不足12张的图片')
            setKnapsackPictures(temparr)
            setPageIndex(temIndex)
            setTurnRightFlag(false)
            pageEnd.current=temIndex
          }else{
            fetchPublications(1)
            setPageFlag(false)

          }
        }else{
          if(fetchColFlag.current == false){
            setKnapsackPictures2(temparr)
            setPageIndex2(temIndex)
            setTurnRight2Flag(false)
            pageEnd2.current=temIndex
          }else{
            fetchCollections(1)
            setPageFlag2(false)

          }
        }
      }

    }
  }
  function turnLeft(e){
    if(pageIndex <= 0){
      alert('当前已经是第一页')
    }else{
      setTurnRightFlag(true)
      e.stopPropagation() //阻止冒泡事件
      // console.log('用户想看上一页')
      pageIndex--
      console.log(pageIndex)
      drawKnapsack(1)
    }
  }
  function turnLeft2(e){
    if(pageIndex2 <= 0){
      alert('当前已经是第一页')
    }else{
      setTurnRight2Flag(true)
      e.stopPropagation() //阻止冒泡事件
      // console.log('用户想看上一页')
      pageIndex2--
      console.log(pageIndex2)
      drawKnapsack(2)
    }
  }
  function turnRight(e){
    if(pageIndex >= pageEnd.current){
      alert('当前是最后一页')
    }else{
      // console.log('你正在使用post的翻页')
      e.stopPropagation() //阻止冒泡事件
      // console.log('用户想看下一页')
      pageIndex++
      // pageIndex++
      console.log('当前页数'+pageIndex)
      drawKnapsack(1)
    }
  }
  function turnRight2(e){
    if(pageIndex2 >= pageEnd2.current){
      alert('当前是最后一页')
    }else{
      // console.log('你正在使用collection的翻页')
      e.stopPropagation() //阻止冒泡事件
      // console.log('用户想看下一页')
      pageIndex2++
      // pageIndex++
      console.log('当前页数'+pageIndex2)
      drawKnapsack(2)
    }
  }
  function ImgClick(e,groupIndex,itemIndex,pictureItem){
    // console.log(e)
    e.stopPropagation()
    // console.log(groupIndex)
    // console.log(itemIndex)
    // console.log(pictureItem)
    let tempState =0
    if(pictureItem.state[0]==0){
      tempState=1
      let tempArr =[].concat(brochure)
      tempArr.push(pictureItem)
      setBrochure(tempArr)
      // brochure.push(pictureItem)
    }else{
      tempState=0
      let tempArr =[].concat(brochure)
      for(let i=0;i<brochure.length;i++){
        if(tempArr[i].src == pictureItem.src)
        {
          tempArr.splice(i,1)
          setBrochure(tempArr)
          break
        }
      }
    }
    // console.log(brochure)
    let temObj =[].concat(knapsackPictures)
    temObj[pageIndex][groupIndex][itemIndex].state[0]=tempState
    setKnapsackPictures(temObj)
  }
  function ImgClick2(e,groupIndex,itemIndex,pictureItem){
    // console.log(e)
    e.stopPropagation()
    // console.log(groupIndex)
    // console.log(itemIndex)
    // console.log(pictureItem)
    let tempState =0
    if(pictureItem.state[0]==0){
      tempState=1
      let tempArr =[].concat(brochure)
      tempArr.push(pictureItem)
      setBrochure(tempArr)
      // brochure.push(pictureItem)
    }else{
      tempState=0
      let tempArr =[].concat(brochure)
      for(let i=0;i<brochure.length;i++){
        if(tempArr[i].src == pictureItem.src)
        {
          tempArr.splice(i,1)
          setBrochure(tempArr)
          break
        }
      }
    }
    // console.log(brochure)
    let temObj =[].concat(knapsackPictures2)
    temObj[pageIndex2][groupIndex][itemIndex].state[0]=tempState
    setKnapsackPictures2(temObj)
  }
  function ImgClick3(e,brochurePictureItem,brochureIndex){
    // console.log(e)
    e.stopPropagation()
    // console.log(brochurePictureItem)
    // console.log(brochureIndex)

    if(brochurePictureItem.state[0]==1){
      let tempArr =[].concat(brochure)
      tempArr[brochureIndex].state[0] =0
      tempArr.splice(brochureIndex,1)
      setBrochure(tempArr)
    }else{
      console.log('出错了,不应该有状态为0的图片')
    }
    // console.log(brochure)
    // let temObj =[].concat(knapsackPictures2)
    // temObj[pageIndex2][groupIndex][itemIndex].state[0]=tempState
    // setKnapsackPictures2(temObj)
}
  function imgLoaded(e,groupIndex,itemIndex,pictureItem){
    // console.log('图片加载完毕')
    if(pictureItem.state[1]==1){
      console.log('图片已经被成功加载过一次')
    }else{
      console.log('正在将图片状态切换成已加载成功')
      let temObj =[].concat(knapsackPictures)
      temObj[pageIndex][groupIndex][itemIndex].state[1]=1
      setKnapsackPictures(temObj)
    }
  }
  function imgLoadedCollection(e,groupIndex,itemIndex,pictureItem){
    // console.log('图片加载完毕')
    // console.log(pictureItem)
    if(pictureItem.state[1]==1){
      console.log('图片已经被成功加载过一次')
    }else{
      let temObj =[].concat(knapsackPictures2)
      temObj[pageIndex2][groupIndex][itemIndex].state[1]=1
      setKnapsackPictures2(temObj)
    }
  }
  function switchPost(){
    setKnapsackSelection(1)
    setPostFlag(true)
    setCollectionFlag(false)
  }
  function switchCollected(){
    console.log('switchC')
    setKnapsackSelection(2)
    setPostFlag(false)
    setCollectionFlag(true)
  }
  async function submitCreate(){
    addCollectionComponentProps.setLoadingFlag(true)
    // console.log(dataCreateBrochure)
    dataCreateBrochure.current.brochure = [].concat(brochure)
    dataCreateBrochure.current.category='Image'
    let time =new Date().getTime()
    dataCreateBrochure.current.id =addCollectionComponentProps.myProfile.handle+time
    dataCreateBrochure.current.bgImg =''
    dataCreateBrochure.current.likes =0
    dataCreateBrochure.current.content =''
    dataCreateBrochure.current.views =0
    dataCreateBrochure.current.slots={}
    const regexStr =/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
    if(dataCreateBrochure.current.brochureName && regexStr.test(dataCreateBrochure.current.brochureName)){
      console.log('册子名字没啥问题')
    }else{
      alert('册子姓名只能是数字、字母和中文组成，不能包含特殊符号和空格。')
      addCollectionComponentProps.setLoadingFlag(false)
      return false
    }
    if(dataCreateBrochure.current.brochureTag.length>0){
      for(let i=0;i<dataCreateBrochure.current.brochureTag.length;i++){
        if(!regexStr.test(dataCreateBrochure.current.brochureTag[i])){
          alert('标签只能是数字、字母和中文组成，不能包含特殊符号和空格。')
          addCollectionComponentProps.setLoadingFlag(false)
          return false
        }
      }
    }else{
      // console.log('至少需要一个标签？')
    }
    if(dataCreateBrochure.current.brochure.length>0){
      console.log('我准备将你的册子写入数据库了')
      let user =addCollectionComponentProps.myProfile.handle
      const searchData = await addCollectionComponentProps.searchUser(user)
      // console.log(searchData)
      if(searchData.data.length>0){
        console.log('找到了用户')
        let data = JSON.parse(searchData.data[0].data)
        let id = searchData.data[0]._id
        // console.log(id)
        // console.log(data)
        // data.brochures={...dataCreateBrochure.current}
        data.brochures.push(dataCreateBrochure.current)
        // brochure.map(el=>{
        //   data.imgAllBeUsed.push(el.src)
        // })
        // let value=JSON.stringify(data)
        const updatedUser= await addCollectionComponentProps.save(id,data)
        // console.log(updatedUser)
        // addCollectionComponentProps.findAndSave(user,value)
        // window.localStorage.setItem(user,value)
        /***********这里估计是一个异步操作，需要loading，然后关闭创建册子的组件，或者直接关闭 */
        addCollectionComponentProps.setaddCollectionComponentFlag(false)
        addCollectionComponentProps.setbodyBCollectionBlankFlag(false)
        addCollectionComponentProps.setMyBrochures(data.brochures)
        addCollectionComponentProps.setLoadingFlag(false)
        // setKnapsackPictures([])
        // setKnapsackPictures2([])
        // dataRef.current = {cursor:[null,null],pictures:[]}
        // dataRefCollections.current = {cursor:[null,null],pictures:[]}
        // console.log(data)
      }else{
        alert('没找到用户，并且没有在用户登录的时候，新建用户')
      }

    }else{
      alert('图册未添加任何图片')
      addCollectionComponentProps.setLoadingFlag(false)
      return false
    }
  }
  async function submitUpdate(){
    addCollectionComponentProps.setLoadingFlag(true)
    let index = addCollectionComponentProps.brochureSelected.current.index
    dataCreateBrochure.current.brochure = [].concat(brochure)
    // console.log(dataCreateBrochure)
    const regexStr =/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
    if(dataCreateBrochure.current.brochureName && regexStr.test(dataCreateBrochure.current.brochureName)){
      console.log('册子名字没啥问题')
    }else{
      console.log('册子姓名只能是数字、字母和中文组成，不能包含特殊符号和空格。')
      addCollectionComponentProps.setLoadingFlag(false)
      return false
    }
    if(dataCreateBrochure.current.brochureTag.length>0){
      for(let i=0;i<dataCreateBrochure.current.brochureTag.length;i++){
        if(!regexStr.test(dataCreateBrochure.current.brochureTag[i])){
          console.log('标签只能是数字、字母和中文组成，不能包含特殊符号和空格。')
          addCollectionComponentProps.setLoadingFlag(false)
          return false
        }
      }
    }else{
      // console.log('至少需要一个标签？')
    }
    if(dataCreateBrochure.current.brochure.length>0){
      console.log('我准备开始修改你的册子了')
      let user =addCollectionComponentProps.myProfile.handle
      const searchData = await addCollectionComponentProps.searchUser(user)
      // console.log(searchData)
      if(searchData.data.length>0){
        console.log('找到了用户')
        let data = JSON.parse(searchData.data[0].data)
        let id = searchData.data[0]._id
        // console.log(data.brochures)
        data.brochures[index]=dataCreateBrochure.current
        // console.log(data)
        const updatedUser= await addCollectionComponentProps.save(id,data)
        // console.log(updatedUser)
        /***********这里估计是一个异步操作，需要loading，然后关闭创建册子的组件，或者直接关闭 */
        addCollectionComponentProps.setaddCollectionComponentFlag(false)
        // addCollectionComponentProps.setbodyBCollectionBlankFlag(false)
        addCollectionComponentProps.setMyBrochures(data.brochures)
        addCollectionComponentProps.setLoadingFlag(false)
      }else{
        alert('没找到用户，并且没有在用户登录的时候，新建用户')
      }

    }else{
      alert('图册未添加任何图片')
      addCollectionComponentProps.setLoadingFlag(false)
      return false
    }
  }
  return(
    <div onClick={cancelPrompt} className={styles.addCollectionContainer}>
      <div className={styles.addCollectionView}>
        <div className={styles.collectionView_part1}>
          <div className={styles.part1_name}>
            <p>NAME</p>
            <input onChange={(e)=>{dataCreateBrochure.current.brochureName= e.target.value}} placeholder={dataCreateBrochure.current.brochureName|| 'illustration'}></input>
          </div>
          <div onClick={cancelCreatBrochure}  className={styles.part1_p2X}></div>
        </div>
        <div className={styles.collectionView_part2}>
          <input onChange={(e)=>{dataCreateBrochure.current.brochureTag[0] = e.target.value}} placeholder={dataCreateBrochure.current.brochureTag[0] || '+ Add label'}></input>
          <input onChange={(e)=>{dataCreateBrochure.current.brochureTag[1] = e.target.value}} placeholder={dataCreateBrochure.current.brochureTag[0] || '+ Add label'}></input>
          <input onChange={(e)=>{dataCreateBrochure.current.brochureTag[2] = e.target.value}} placeholder={dataCreateBrochure.current.brochureTag[0] || '+ Add label'}></input>
        </div>
        <div className={styles.collectionView_part3}>
          <div className={styles.part3CollectionView_imgContainer}>
 
            {
              brochure.map((brochurePictureItem,brochureIndex)=>{
                return <div key={brochureIndex} className={styles.part3CollectionView_imgItem}>
                <img  className={brochurePictureItem.state[0]==1 ? styles.imgSelectedBr6 :undefined} src={brochurePictureItem.src || noImage} ></img>
                {brochurePictureItem.state[0]==1 && <div onClick={(e) =>{ImgClick3(e,brochurePictureItem,brochureIndex)}} className={styles.imgESC}></div>}
                {/* {brochurePictureItem.state[0]==1 && <div className={styles.imgSelected2}></div>} */}
                </div>
              })
            }   
          </div>
          {
            brochure.length>8 && <div className={styles.scrollInfo}>
            <div className={styles.chevron}></div>
            <div className={styles.chevron}></div>
            <div className={styles.chevron}></div>  
            </div>  
          }

        </div>
        <div className={styles.collectionView_part4}>
        {addCollectionComponentProps.addOrEditCollectionComponentFlag ? <button onClick={submitCreate}  className={styles.part4_createBtn }>Create</button> :  <button onClick={submitUpdate}  className={styles.part4_createBtn }>update</button>  }
      
        </div>
      </div>
      <div className={styles.addCollectionKnapsack}>
        <div className={styles.knapsack_part1}>
          <div className={styles.part1_p1}>Knapsack</div>
          {/* <div className={styles.part1_p2}>🗙</div> */}
        </div>
        <div className={styles.knapsack_part2}>Support batch selection</div>
        <div className={styles.knapsack_part3}>
          {/* <div onClick={turnLeft} className={styles.part3_turnleft}>←</div> */}
          <div className={styles.part3_imgContainer}>
            {
              knapsackSelection == 1 && knapsackPictures[pageIndex] && knapsackPictures[pageIndex].map((knapsackPicturesGroup,groupIndex)  =>{
                return <div key={groupIndex} className={styles.imgGroup}>
                  {
                    knapsackPicturesGroup.map((pictureItem,itemIndex) =>{
                      return <div key={itemIndex} onClick={(e) =>{ImgClick(e,groupIndex,itemIndex,pictureItem)}} className={styles.part3_imgItem}>
                      <img onLoad={(e) =>{imgLoaded(e,groupIndex,itemIndex,pictureItem)}} className={pictureItem.state[0]==1 ? styles.imgSelectedBr3 :undefined}  src={pictureItem.state[1]==1? pictureItem.src : noImage} ></img>
                      {pictureItem.state[0]==1 && <div className={styles.imgSelected2}></div>}
                      </div>
                    })
                  }
                </div>
              })
            }
            {
              knapsackSelection == 2 && knapsackPictures2[pageIndex2] && knapsackPictures2[pageIndex2].map((knapsackPictures2Group,groupIndex)  =>{
                return <div key={groupIndex} className={styles.imgGroup}>
                  {
                    knapsackPictures2Group.map((pictureItem,itemIndex) =>{
                      return <div key={itemIndex} onClick={(e) =>{ImgClick2(e,groupIndex,itemIndex,pictureItem)}} className={styles.part3_imgItem}>
                      <img onLoad={(e) =>{imgLoadedCollection(e,groupIndex,itemIndex,pictureItem)}}  className={pictureItem.state[0]==1 ? styles.imgSelectedBr3:undefined}  src={pictureItem.state[1]==1? pictureItem.src : noImage} ></img>
                      {pictureItem.state[0]==1 && <div className={styles.imgSelected2}></div>}
                      </div>
                    })
                  }
                </div>
              })
            }     
          </div>
          {/* <div onClick={turnRight} className={styles.part3_turnright}>→</div> */}
        </div>
        <div className={styles.knapsack_part4}>
          {
            pageFlag && knapsackSelection == 1 && <div className={styles.part4_PageBtn}>
            <div onClick={turnLeft}  className={styles.part4_PageBtn_turnLeft}></div>
            <div className={styles.part4_PageBtn_PageInfo}></div>
            {turnRightFlag && <div onClick={turnRight} className={styles.part4_PageBtn_turnRight}></div>}
            </div>
          }
          {
            pageFlag2 && knapsackSelection == 2 && <div className={styles.part4_PageBtn}>
            <div onClick={turnLeft2} className={styles.part4_PageBtn_turnLeft}></div>
            <div className={styles.part4_PageBtn_PageInfo}></div>
            {turnRight2Flag && <div onClick={turnRight2} className={styles.part4_PageBtn_turnRight}></div>}
            </div>            
          }
          <div className={styles.kindsOfKnapsack}>
            <div onClick={switchPost} className={ postFlag == true? styles.postKnapsack : styles.postKnapsackUnselected }>POST</div>
            <div className={styles.delimiter}></div>
            <div onClick={switchCollected} className={collectionFlag == true? styles.collectionKnapsack : styles.collectionKnapsackUnselected}>COLLECTION</div>
          </div>
        </div>
      </div>
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
function AddExhibitionComponent({addExhibitionComponentProps}){
  console.log('开始策展')
  const [exhibitionStageElements,setExhibitionStageElements] =React.useState([])
  function initMaterial(e,src,width,height){
    console.log('你选中了这张图片')
    /****test */
    let obj={}
    obj.width=185
    obj.height=104
    obj.backgroundImage='url(' + 'https://lens.infura-ipfs.io/ipfs/bafybeibqs6qjw2m4bab3cg3ztpeakqbwdnebkvvpfqv4miyxj3t7cmdeqa' + ')'
    obj.backgroundSize ='cover'
    obj.backgroundRepeat='no-repeat'
    /****test */
    let temArr =[].concat(exhibitionStageElements)
    temArr.push(obj)
    setExhibitionStageElements(temArr)
    console.log(exhibitionStageElements)
  }
  function onResize(e,obj,stageElementItem,itemIndex){
    // e.stopPropagation()
    console.log(e)
    console.log(obj)
    console.log(stageElementItem)
    let temArr=[].concat(exhibitionStageElements)
    temArr[itemIndex].width=obj.size.width
    temArr[itemIndex].height=obj.size.height
    setExhibitionStageElements(temArr)
    // addExhibitionComponentProps.setDragDisabled(false)
    // this.setState({width: size.width, height: size.height});
    // setExhibitionStageElements
  }
  function onResizeStart(e,obj){
    console.log('开始修改尺寸并不可以拖拽')
    e.stopPropagation()
    console.log(e)
    addExhibitionComponentProps.setDragDisabled(true)
  }
  function onResizeStop(e,obj){
    console.log('结束了修改尺寸并可以拖拽')
    e.stopPropagation()
    console.log(e)
    addExhibitionComponentProps.setDragDisabled(false)
    // addExhibitionComponentProps.setDragDisabled(false)
  }
  function onMouseDown(){
    console.log('鼠标已经按下')
    // addExhibitionComponentProps.setDragDisabled(false)
  }
  function onStart(){
    console.log('开始拖拽')
    // addExhibitionComponentProps.setDragDisabled(false)
  }
  function onStop(){
    console.log('结束了拖拽')
  }
  return(
    <div className={styles.addExhibitionContainer}>
      <div className={styles.materialLibrary}></div>
      <div className={styles.materialView}>
        <img src='https://i.328888.xyz/2023/01/08/k5Wyy.png' onClick={(e) =>{initMaterial()}}></img>
      </div>
      <div className={styles.createExhibitionStage}>
        {exhibitionStageElements.length >0 && exhibitionStageElements.map((stageElementItem,itemIndex)=>{

          return <Draggable onMouseDown={(e)=>{onMouseDown(e)}} onStart={(e)=>{onStart(e)}} onStop={(e)=>{onStop(e)}}  disabled={addExhibitionComponentProps.dragDisabled} key={itemIndex}>
            <div style={{width:stageElementItem.width,height:stageElementItem.height}}>
              <Resizable   width={stageElementItem.width} height={stageElementItem.height} onResize={(e,obj)=>{
                onResize(e,obj,stageElementItem,itemIndex)
              }} onResizeStart={(e,obj) =>{onResizeStart(e,obj)}} onResizeStop={(e,obj) =>{onResizeStop(e,obj)}} resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}>
                <div style={{width:stageElementItem.width,height:stageElementItem.height,backgroundImage:stageElementItem.backgroundImage,backgroundSize:stageElementItem.backgroundSize,backgroundRepeat:stageElementItem.backgroundRepeat}}>
                </div>
              </Resizable>
            </div>
          </Draggable>
        })
        }
      </div>
    </div>
  )
}
function BodyBCollectionFull({bodyBCollectionFullProps}){
  /**************打开册子的开关 ************/
  const [openBrochureFlag,setOpenBrochureFlag] = React.useState(false)
  /**********需要绘制册子里的图片所用到的三个数组 */
  const [updateBrochureItem,setUpdateBrochureItem] = React.useState([])
  const [brochureLeftItem,setBrochureLeftItem] = React.useState([])
  const [brochureRightItem,setBrochureRightItem] = React.useState([])
  /**************判断是否可以翻页的开关 */
  var [pageIndex,setPageIndex]=React.useState(0)
  const [brochurePageLeftFlag,setBrochurePageLeftFlag] =React.useState(false)
  const [brochurePageRightFlag,setBrochurePageRightFlag] =React.useState(false)
  /************点击册子后打开册子的函数 */
  
  function brochureClick(e,brochureItem,brochureIndex){
    /*****首先初始化 */
    // console.log(brochureItem,brochureIndex)
    setOpenBrochureFlag(true)
    // setPageIndex(pageIndex)
    drawBrochure(brochureItem.brochure)
  }
  async function brochureDelete(e,brochureItem,brochureIndex){
    bodyBCollectionFullProps.setLoadingFlag(true)
    /******先得到我的背包里面的所有册子的数组  */
    let temArr = [].concat(bodyBCollectionFullProps.myBrochures)
    /*******再得到要删掉的册子的序号 */
    let delNum = brochureIndex
    /****删除并保存 */
    temArr.splice(delNum,1)
    // console.log(temArr)
    let user =bodyBCollectionFullProps.myProfile.handle
    const searchData = await bodyBCollectionFullProps.searchUser(user)
    // console.log(searchData)
    if(searchData.data.length>0){
      console.log('找到了用户')
      let data = JSON.parse(searchData.data[0].data)
      let id = searchData.data[0]._id
      data.brochures = temArr
      // console.log(data)
      const updatedUser= await bodyBCollectionFullProps.save(id,data)
      // console.log(updatedUser)
      bodyBCollectionFullProps.setMyBrochures(temArr)
      bodyBCollectionFullProps.setLoadingFlag(false)
    }else{
      alert('没找到用户，并且没有在用户登录的时候，新建用户')
    }
  }
  function brochureEdit(e,brochureItem,brochureIndex){
    console.log('正在编辑册子')
    brochureItem.index =brochureIndex
    let tempStr = JSON.stringify(brochureItem)
    let temObj = JSON.parse(tempStr)
    // console.log(temObj)
    bodyBCollectionFullProps.brochureSelected.current= temObj
    // console.log(bodyBCollectionFullProps.brochureSelected.current)
    bodyBCollectionFullProps.setaddCollectionComponentFlag(true)
    bodyBCollectionFullProps.setAddOrEditCollectionComponentFlag(false)
  }
  function drawBrochure(updateBrochureItem){
    if(brochureLeftItem[pageIndex]){
      return false
    }
    /**********然后生成册子，因为册子默认显示2页，每一页4张图片，所以需要俩个数组 */
    let updateArr =[].concat(updateBrochureItem)
    if(updateArr.length>8){
      let leftArr=[].concat(brochureLeftItem)
      let rightArr=[].concat(brochureRightItem)
      leftArr[pageIndex] = updateArr.splice(0,4)
      rightArr[pageIndex] = updateArr.splice(0,4)
      setBrochureLeftItem(leftArr)
      setBrochureRightItem(rightArr)
      // console.log(leftArr)
      // console.log(rightArr)
      setUpdateBrochureItem(updateArr)
      setBrochurePageRightFlag(true)
    }else{
      setBrochurePageRightFlag(false)
      let leftArr=[].concat(brochureLeftItem)
      let rightArr=[].concat(brochureRightItem)
      leftArr[pageIndex] = updateArr.splice(0,4)
      rightArr[pageIndex]  = updateArr
      setBrochureLeftItem(leftArr)
      setBrochureRightItem(rightArr)
      // console.log(leftArr)
      // console.log(rightArr)
    }
  }
  function closeBrochure(){
    setUpdateBrochureItem([])
    setBrochureLeftItem([])
    setBrochureRightItem([])
    setPageIndex(0)
    setBrochurePageRightFlag(false)
    setBrochurePageLeftFlag(false)
    setOpenBrochureFlag(false)
  }
  function pageUp(){
    pageIndex++
    setBrochurePageLeftFlag(true)
    console.log('当前页数'+pageIndex)
    setPageIndex(pageIndex)
    drawBrochure(updateBrochureItem)
  }
  function pageDown(){
    pageIndex--
    if(pageIndex ==0){
      console.log('当前是第0页')
      setPageIndex(pageIndex)
      setBrochurePageLeftFlag(false)
      setBrochurePageRightFlag(true)
      return false
    }else{
      console.log('当前页数'+pageIndex)
      setPageIndex(pageIndex)
      // drawBrochure(updateBrochureItem)
    }
  }
  return(
    <div className={styles.bodyBCollectionFull}>
      {
        bodyBCollectionFullProps.myBrochures.map((brochureItem,brochureIndex) =>{
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
              <div onClick={(e) =>{brochureDelete(e,brochureItem,brochureIndex)}}  className={styles.brochureContralDel}></div>
              <div onClick={(e) =>{brochureEdit(e,brochureItem,brochureIndex)}}  className={styles.brochureContralEdit}></div>
              <div className={styles.brochureMediaShare}></div>
            </div>
          </div>
  </div>
})
      }
      {
        openBrochureFlag ==true && <div className={styles.openBrochureContainer}>
          <div className={styles.brochureContent}>
            {brochurePageLeftFlag && <div onClick={pageDown} className={styles.brochurePageLeft}></div>}
            { 
              brochureLeftItem[pageIndex] && brochureLeftItem[pageIndex].map((brochurePictureItem,brochurePictureIndex) =>{
                return <div key={brochurePictureIndex} className={styles.brochureContentItem}  >
                  <img src={brochurePictureItem.src}></img>

                  <a target="_blank" href={'https://lenster.xyz/posts/'+brochurePictureItem.id}>LENSTER</a>
                </div>
              })
            }            
          </div>
          <div onClick={closeBrochure} className={styles.buttonContainerCancel}></div>
          <div className={styles.brochureContent2}>
            {brochurePageRightFlag && <div onClick={pageUp} className={styles.brochurePageRight}></div> }
            {
              brochureRightItem[pageIndex] && brochureRightItem[pageIndex].map((brochurePictureItem,brochurePictureIndex) =>{
                return <div key={brochurePictureIndex} className={styles.brochureContentItem}  >
                  <img src={brochurePictureItem.src}></img>
                  <a target="_blank" href={'https://lenster.xyz/posts/'+brochurePictureItem.id}>LENSTER</a>
                </div>
              })
            }
          </div>

        </div>
      }
    </div>
  )
}
function BodyBExhibitionFull(){
  // console.log(8)
    return(
        <div className={styles.bodyBExhibitionFull}>
    </div>
      )
}
function Loading(){
  return(
    <div className={styles.loadingFade}>
      <div className={styles.loadingContainer}>
        <div className={styles.stick}></div>
        <div className={styles.stick}></div>
        <div className={styles.stick}></div>
        <div className={styles.stick}></div>
        <div className={styles.stick}></div>
        <div className={styles.stick}></div>
        <div className={styles.h1}>Loading...</div>
      </div>
    </div>   
  )
}
export default function Home() {
  // console.log(0)
  // const [width, setWidth] = React.useState(0)
  var screenWidth =React.useRef(0)
  const [bodyACollectionFlag, setbodyACollectionFlag] = React.useState(true) 
  const [bodyAExhibitionFlag, setbodyAExhibitionFlag] = React.useState(false) 
  const [bodyBCollectionBlankFlag, setbodyBCollectionBlankFlag] = React.useState(true) 
  const [bodyBExhibitionBlankFlag, setbodyBExhibitionBlankFlag] = React.useState(true)
  const [addCollectionComponentFlag,setaddCollectionComponentFlag] =React.useState(false)
  const [addExhibitionComponentFlag,setaddExhibitionComponentFlag] =React.useState(false)
  /*********************************获取个人在LENS上的信息开*********************** */
  const [myProfile,setMyProfile] =React.useState()
  /*********************************获取个人在LENS上的信息关*********************** */
  /******用来切换新增相册还是编辑相册 addCollectionComponent*/
  const [addOrEditCollectionComponentFlag,setAddOrEditCollectionComponentFlag] = React.useState(true)
  /****册子必须是全局变量，因为它要在好几个组件中显示*/
  const [myBrochures,setMyBrochures] =React.useState([])
  var brochureSelected =React.useRef({brochure:[],brochureTag:[],brochureName:null})
  /*********拖拽必须是全局变量，否则在组件每次渲染时都会重置状态 */
  const [dragDisabled,setDragDisabled] =React.useState(false)

  /*********loading动画状态开关 */
  const [loadingFlag,setLoadingFlag] = React.useState(false)
  /*******************************操作我们数据库的相关函数 开 */

const createUser = async (name,value) => {
  const userName = name
  const userData = value
  const res = await fetch('/api/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userName,
      data: userData,
    }),
  });
  const data = await res.json()
  console.log(data)
  setLoadingFlag(false)
}
const searchUser = async (name) => {
  const userName = name
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userName,
    }),
  });
  const data = await res.json()
  return data
}
const save = async (id,value) => {
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id:id,
      value:value,
    }),
  });
  const data = await res.json()
  return data
}
/***************操作我们数据库的相关函数 关********************** */

  // /*********************************获取用户在我们数据库 包含已创建图册的全图片数组，和图册对象 开*** */
  // const [imgAllBeUsed,setImgAllBeUsed] =React.useState([])

  // /*********************************获取用户在我们数据库 包含已创建图册的全图片数组，和图册对象 关*** */

  React.useEffect(() => {
    // console.log('UE0')
    /**********************************************根据窗口尺寸来调整html根元素fontsize************************************* **/
    // const handleResize = () => {
    //   setWidth(window.innerWidth);
    // }
    // setbodyACollectionFlag(false)
    var fz = window.innerWidth / (1440/28)
    screenWidth.current =window.innerWidth
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
    <Header headerProps={{bodyACollectionFlag,bodyAExhibitionFlag,setbodyACollectionFlag,setbodyAExhibitionFlag,addCollectionComponentFlag,setaddCollectionComponentFlag,setbodyBCollectionBlankFlag,myProfile,setMyProfile,setMyBrochures,createUser,searchUser,setLoadingFlag}}></Header>
    {bodyACollectionFlag == true && <BodyACollection bodyACollectionProps={{setaddCollectionComponentFlag,myProfile,setMyProfile,setAddOrEditCollectionComponentFlag,brochureSelected}}></BodyACollection>
    }
    {
      bodyAExhibitionFlag == true && <BodyAExhibition bodyAExhibitionProps={{setbodyAExhibitionFlag,setaddExhibitionComponentFlag}}></BodyAExhibition>
    }
    {
      bodyACollectionFlag == true && bodyBCollectionBlankFlag == true && !addCollectionComponentFlag && <BodyBCollectionBlank></BodyBCollectionBlank>
    }
    {
      addCollectionComponentFlag == true && <AddCollectionComponent addCollectionComponentProps={{addCollectionComponentFlag,setaddCollectionComponentFlag,myProfile,setMyProfile,setbodyBCollectionBlankFlag,myBrochures,setMyBrochures,createUser,searchUser,save,setLoadingFlag,addOrEditCollectionComponentFlag,brochureSelected}} ></AddCollectionComponent>
    }
    {
      bodyACollectionFlag == true && bodyBCollectionBlankFlag == false && !addCollectionComponentFlag && <BodyBCollectionFull bodyBCollectionFullProps={{myBrochures,setMyBrochures,myProfile,searchUser,save,setLoadingFlag,setaddCollectionComponentFlag,setAddOrEditCollectionComponentFlag,brochureSelected}}></BodyBCollectionFull>
    }
    {
      bodyAExhibitionFlag == true && bodyBExhibitionBlankFlag == true && <BodyBExhibitionBlank></BodyBExhibitionBlank>
    }
    {/* {
      screenWidth.current>750 && addExhibitionComponentFlag == true && <AddExhibitionComponent addExhibitionComponentProps={{addExhibitionComponentFlag,setaddExhibitionComponentFlag,myProfile,setMyProfile,myBrochures,setMyBrochures,dragDisabled,setDragDisabled}} ></AddExhibitionComponent>
    } */}
    {
      bodyAExhibitionFlag == true && bodyBExhibitionBlankFlag == false && <BodyBExhibitionFull></BodyBExhibitionFull>
    }
    {
      loadingFlag == true && <Loading></Loading>
    }

  </div>
  )
}