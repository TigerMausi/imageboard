///////////////////////////// VUE CODE //////////////////////
// NOT ADVISABLE TO USE ARROW FUNCTIONS ///////////////////
(function() {
    Vue.component("image-modal", {
        template: "#theTemplate", //is an id that i will later on use, in script type -> outside main
        props: ["id"], //:id="currentImage"
        data: function() {
            return {
                imageData: {},

                //to be filled leter with the input from user - comments
                form: {
                    comment: "",
                    username: ""
                },
                comments: []
            };
        },

        /* RUNS WHEN HTML HAS LOADED but the VUE LOGIC hasn't yet used very often, for MAKING AJAX REQUESTS FOR GETTING DATA (from API or DATaBASE) so the page can load correctly
 -> for example, we'd most likely get our list of cities from an DATABASE or API
 -> mounted would be the best place to make that request
 -> then function runs once we received a response from the server */
        mounted: function() {
            console.log("CURRENT IMAGE IN MOUNTED", this.id);

            let self = this;
            // console.log(
            //     "(THIS) IN MOUNTED THE SELECTED IMG - THE MODAL, gives me the actual object/photo",
            //     self
            // );

            // DOING AXIOS REQUEST TO THE SERVER TO ONLY DISPLAY THE -- ONE -- IMAGE
            axios
                .get("/images/" + this.id)
                .then(function(response) {
                    // console.log(
                    //     "DATA FROM SERVER REQUEST -> response.data",
                    //     response.data[0]
                    // );

                    //HOW TO CUT OR CONVERT DATE??? DOES NOT WORK LIKE THAT?
                    //let date = self.imageData.created_at;
                    //date.substring(0, 5);
                    // console.log("NEW DATE", date);

                    self.imageData = response.data[0];
                    //console.log("CUT FROM HERE", self.imageData);

                    // console.log(
                    //     "DOING AXIOS REQUEST TO THE SERVER TO ONLY DISPLAY THE -- ONE -- IMAGE, THE SELF IMAGE ",
                    //     self.imageData
                    // );
                    // console.log(
                    //     "URL FOR THE ONE IMAGE SELECTED",
                    //     selfImg.imageData.url
                    // );
                })
                .then(function() {
                    console.log("THIS COMMENT", self.id);
                    axios.get("/comments/" + self.id).then(function(response) {
                        console.log("RESPONSE IN COMMENTS", response);

                        self.comments = response.data;
                        // console.log(
                        //     "THE DATA WE GOT AFTER MAKING THE AJAX GET REQUEST",
                        //     self.comments
                        // );
                    });
                })
                .catch(function(err) {
                    console.log("ERROR IN AXIOS GET REQUESTS", err);
                });
        },
        methods: {
            closeComponent: function() {
                this.$emit("close");
            },

            insertComment: function(e) {
                //MAYBE THE BUTTON REFRESHES ITSELF AND DATA IS LOST?
                e.preventDefault();
                // console.log("e in insertComment", e);

                let self = this;
                // console.log("SELF COMMENTS", self);
                // console.log("SELF COMMENTS ID", self.id);

                //MAKE THE AXIOS POST REQUEST FOR SENDING DATA TO SERVER
                console.log("this iddddd!!!!!", this.id);

                axios
                    .post("/comment/" + this.id, self.form)
                    .then(function(response) {
                        console.log(response.data);

                        console.log(" -> response.data", response.data);

                        self.comments.unshift(response.data[0]);
                        // console.log(
                        //     "COMMENTS INSERTED : ",
                        //     response.data.rows[0]
                        // );
                    })
                    .catch(function(err) {
                        console.log(
                            "ERROR WHEN POSTING COMMENTS TO SERVER",
                            err
                        );
                    });
            }
        }
    });

    /* LESSONS DAVID
    Vue.component("Firstcomponent", {
        // --- don't need an el they create their own html
        //you can pass the form for instance :)
        //DATA NEED TO BE A FUNCTION
        //better like that as it may be running on an old pc as server
        data: function() {
            return {
                name: "NameComponent"
            };
        },
        // --- `` this is not working on all browsers
        //
        template: "<div><{{ name }}><coconut></coconut></div>",

        mounted: {},

        methods: {}
    });

    Vue.component("coconut", {
        methods: {
            coco: function() {
                console.log("fdfg");
            }
        },
        template:
            '<div style= "font-size= 40px" @click="COCO">🥥 <{{ name }}><coconut> 🥥 </coconut></div>'
    });

    Vue.component("some-template", {
        data: function() {
            return {
                heading: "Some Component"
            };
        },
        template: "#some-template"
    });
*/
    new Vue({
        el: "#main",
        data: {
            images: [], //need to add here the img

            showModal: false,
            loadHash: null,
            moreImgs: true,

            currentImage: location.hash.slice(1) || 0, //set property afterwards to
            username: "",

            form: {
                title: "",
                username: "",
                description: "",
                file: null
            }
        }, // data ends

        /* RUNS WHEN HTML HAS LOADED but the VUE LOGIC hasn't yet, used very often, for MAKING AJAX REQUESTS FOR GETTING DATA (from API or DATaBASE) so the page can load correctly
 -> for example, we'd most likely get our list of cities from an DATABASE or API
 -> mounted would be the best place to make that request
 -> then function runs once we received a response from the server
 // ------- AXIOS ------------
 // JS library that's going to allow us to make requests to servers*/
        mounted: function() {
            //console.log("vue instance has mounted!!!!");
            let self = this;

            //EVent that will be triggered for when the hash has changed
            window.addEventListener("load", function() {
                if (this.location.hash) {
                    this.loadHash = location.hash.slice(1);

                    axios
                        .post("/get-img-hash", { id: this.loadHash })
                        .then(function(data) {
                            if (data.data.rowCount === 0) {
                                self.loadHash = null;
                                self.showModal = false;
                            } else {
                                self.currentImage = data.data.rows[0];
                                self.showModal = true;
                            }
                        });
                } else {
                    this.loadHash = null;
                }
            });

            //IMAGES FROM SERVER
            axios
                .get("/images")
                .then(function(response) {
                    console.log("response from server: ", response.data); // NOT SAFE COMMMENT OUT
                    console.log("THIS!!!!!!", this);
                    self.images = response.data;

                    //check if there's still imgs
                    if (response.data.length) {
                        self.moreImgs = true;
                    }
                })
                .catch(function(err) {
                    console.log("err: ", err);
                });
            // NO ERROR FUNCTIONS IN THE FRONT
        },

        //USED EXCLUSIVLEY FOR EVENTS
        //EVERY FUNCTION THAT RUNS IN RESPONSE TO AN EVENT WILL BE DEFINED INSIDE THE METHODS
        methods: {
            deleteImage: function() {
                // let this_img = this;
                //
                // axios.post("/delete-img/" + this.id).then(function(data) {
                //
                // });
            },

            displayMoreEventHandler: function() {
                var self = this;

                //get last img from array
                var lastImg = this.images[this.images.length - 1].id;

                axios.get("/get-more-imgs/" + lastImg).then(function(response) {
                    console.log(
                        "The lastImg in displayMoreEventHandler",
                        lastImg
                    );
                    self.images.push.apply(self.images, response.data);
                    lastImg = self.images[self.images.length - 1].id;

                    if (lastImg == 4) {
                        self.moreImgs = false;
                    }
                });
            },

            closeModal: function() {
                console.log("here will be called my close component function");
                this.currentImage = null;
            },

            //SETTING THE IMAGE THAT WAS CLICKED TO BE THE CURRENT
            //FUNCTION FOR PARENT - to child?
            setCurrentimage: function(imgId) {
                this.currentImage = imgId;
                console.log(
                    "Current image SUCCESFUL: SET CURRENT imG: ",
                    imgId
                );
            },

            uploadFile: function(e) {
                // call preventDefault to tell button
                // not to reload the page
                e.preventDefault();
                // formData is just for files
                var formData = new FormData();
                var self = this;

                formData.append("file", this.form.file);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);

                axios
                    .post("/upload", formData)
                    .then(data => {
                        self.images.unshift(data.data[0]);
                        console.log(self.images);
                    })
                    .catch(err => {
                        console.log("errorddd", err);
                    });
                console.log("this in uploadFile: ", this);
                console.log("formData in uploadFile: ", formData);
            },

            // every function that runs in response to an event
            // will be defined in methods
            handleFileChange: function(e) {
                //console.log("e in handleFileChange: ", e);
                this.form.file = e.target.files[0];
                console.log("this in handleFileChange: ", this);
            }
        }
    });
})();
