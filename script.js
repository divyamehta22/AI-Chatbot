let prompt = document.querySelector('#prompt');
let chatContainer = document.querySelector('.chat-container');
let imageBtn = document.querySelector('#image')
let imageInput = document.querySelector('#image input')
let submitBtn = document.querySelector('#submit')

//gemini text generation api
const api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAyKbUXxZ1_6bF40QAGnksi4HCRECtQv8o";

//user object
let user={
    message:null,
    file:{                  //required for api as mentioned in gemini api
        mime_type:null,
        data:null,          //data of image must be in base64, it converts image to text
    }
}

// access prompt at any key press
prompt.addEventListener('keydown', (e)=>{
    // console.log(e)
    // if key pressed is enter then we have our prompt value
    if(e.key=='Enter'){
        handleChatResponse(prompt.value);
    }
})

submitBtn.addEventListener('click',()=>{
    handleChatResponse(prompt.value);
})

const handleChatResponse = (message) => {
    user.message=message;

    //image:- if image is uploaded then show image. For url get it from e event which was used below
    let html = ` <img src="user.png" alt="" id="userImage" width="7%">
            <div class="user-chat-area">
                ${message}
                ${user.file.data? `<img src='data:${user.file.mime_type};base64,${user.file.data}' class="chosenImg">`
                     :""}
            </div>`;
    
    let userChatBox = createChatBox(html, 'user-chat-box');
    // div is returned
    chatContainer.appendChild(userChatBox);

    //after appending set prompt to null
    prompt.value="";

    //scrolling chatConatiner automatically
    chatContainer.scrollTo({top:chatContainer.scrollHeight, behavior:"smooth"});

    // after 600ms ai chat box must appear
    setTimeout(()=>{
        let html = `
             <img src="ai.png" alt="" id="aiImage" width="7%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="" width="30" class="load">
            </div>
        `;

        let aiChatBox = createChatBox(html, 'ai-chat-box')
        chatContainer.appendChild(aiChatBox);
        //function for generating api response
        generateResponse(aiChatBox);
    }, 600);
}

const createChatBox = (html, classes) => {
    let div = document.createElement('div');
    div.innerHTML=html;
    div.classList.add(classes);
    return div;
}

const generateResponse = async(aiChatBox) => {
    let text = aiChatBox.querySelector('.ai-chat-area');

    //from gemini api key
    let requestOption={
        method:"POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "contents": [{
              "parts":[
                {"text": user.message},(user.file.data?[{           //check whether image is there or not and provide it to api in its format
                    "inline_data":user.file
                }]:[])
                ]
              }]
            })
    }

    try{
        // fetch by default goes for get method but we need post
        let response = await fetch(api_url, requestOption);
        let data = await response.json();
        // console.log(data);
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        // console.log(apiResponse)
        text.innerHTML = apiResponse;
    }catch(error){
        console.log(error);
    }finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight, behavior:"smooth"});
        user.file="";
    }
}

//accessing images on system        accessing input type with automation which was hidden
imageBtn.addEventListener('click',()=>{
    imageInput.click();
});

//whenever any file is selected
imageInput.addEventListener('change',()=>{
    //the file selected will come in file variable
    const file = imageInput.files[0];
    if(!file) return

    //FileReader is class that is used to access data of file     reader is object of that class
    let reader = new FileReader();

    //whenever reader starts loading/reading
    reader.onload=(e)=>{
        // console.log(e)
        //accessing data provided by e which is already in base64
        let base64string = e.target.result.split(',')[1];
        user.file={                 
            mime_type: file.type,
            data: base64string,         
        }
    }

    //specifies what url must reader read
    reader.readAsDataURL(file);
})