document.addEventListener('DOMContentLoaded', function () {
    const Delta = Quill.import("delta");

    const title = document.getElementById('title');
    title.value = subm_obj.title;

    const task = new Quill('#task', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true // Make the editor uneditable
    });

    //JSON -> Delta
    const task_delta = JSON.parse(task_obj.text);
    task.setContents(task_delta);

    let comments = [];

    if (subm_obj.type === 'text'){
        const essay = new Quill('#essay', {
            theme: 'snow',
            modules: {
                toolbar: false // Disable the toolbar
            },
            readOnly: true // Make the editor uneditable
        });

        //JSON -> Delta
        const essay_delta = JSON.parse(subm_obj.text);
        essay.setContents(essay_delta);      
        
        const fileWrap = document.getElementById('file-wrap');
        fileWrap.style.display = 'none';

        //Highlight Logic:
        //Inside existing comment → nothing happens
        //Exactly the comment → comment is removed
        //Overlaps → highlight only part outside comment
        //Includes comment → old comment removed, highlight new text
        //No overlapping comments allowed

        essay.on('selection-change', (range, oldRange, source) => {
            if (!range || range.length === 0) return;

            const start = range.index;
            const end = start + range.length;

            comments = add_comment(comments, start, end);
            console.log("finish");
            console.log(comments);

            redrawHighlights(essay, comments);
        });

        function add_comment(comments, start_index, finish_index){
            console.log("start");
            console.log(comments);
            //Simplest case -> first push
            if (comments.length === 0) {
                comments.push({'start': start_index, 'finish': finish_index});
                return comments; 
            }
            
            //Inside existing comment logic -> If so, return
            //Refine it with the = signs!
            for (let i = 0; i < comments.length; i++) {
                if ((comments[i]['start'] <= start_index) && (comments[i]['finish'] >= finish_index)){
                    //Special case -> exact comments
                    if ((comments[i]['start'] == start_index) && (comments[i]['finish'] == finish_index)){
                        console.log("Hello!");
                        comments.splice(i, 1);
                        console.log(comments);
                    }
                    return comments;
                } 
            }

            //Engulf comment logic -> Delete all engulfed comments
            for (let i = 0; i < comments.length; i++) {
                if ((comments[i]['start'] >= start_index) && (comments[i]['finish'] <= finish_index)){
                    comments.splice(i, 1);
                }
            }

            //Overlap logic
            for (let i = 0; i < comments.length; i++) {
                if (comments[i]['start'] > start_index) {
                    //Check for the comment on the left side
                    if (i>0) {
                        if (comments[i-1]['finish'] > start_index) {
                            start_index = comments[i-1]['finish'] + 1;
                        }
                    } 
                    //Check collision with right side
                    if (comments[i]['start'] < finish_index) {
                        finish_index = comments[i]['start'] - 1;
                    }
                    comments.splice(i, 0, {'start': start_index, 'finish': finish_index}); 
                    return comments;
                }
            }
            
            //Place it to the right-most side
            if (comments[comments.length-1]['finish'] > start_index) {
                start_index = comments[comments.length-1]['finish'] + 1;
            }
            
            comments.push({'start': start_index, 'finish': finish_index});
            return comments; 
        }

        function redrawHighlights(essay, comments) {
            const Delta = Quill.import("delta");
            let delta = new Delta();
        
            // 1) Clear all existing highlights
            const fullLength = essay.getLength();
            if (fullLength > 0) {
                // remove highlight format from entire document
                delta = delta.retain(fullLength);
            }
        
            // If no comments, nothing else to do
            if (!comments.length) return;
        
            // 2) Sort comments to apply in order
            comments.sort((a, b) => a.start - b.start);
        
            // 3) Build a delta to apply highlights
            let pos = 0;
        
            for (const c of comments) {
                const length = c.finish - c.start;
                const gap = c.start - pos;
        
                if (gap > 0) {
                    delta = delta.retain(gap); // skip unformatted text
                }
        
                delta = delta.retain(length, { highlight: "c-12345" }); // apply highlight
        
                pos = c.finish;
            }

            console.log(delta);
        
            // 4) Apply highlights in one go
            essay.updateContents(delta, "api");
        }
        
        
        } else {
        const fileFrame = document.getElementById('file-frame');
        fileFrame.src = `/api/serve_static/essays/submission_${subm_obj.id}.pdf`;
    }

    const form = document.getElementById('mainForm');

    const feedback = new Quill('#feedback', {
        theme: 'snow'
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const feedbackInput = document.getElementById('feedback-input');
        const textDelta = feedback.getContents(); // Get the Delta content of the editor
        feedbackInput.value = JSON.stringify(textDelta); // Convert the Delta to a JSON string and assign it to the input field

        const emptyDelta = { "ops": [{ "insert": "\n" }] };
        if (JSON.stringify(textDelta) !== JSON.stringify(emptyDelta)) {      
            form.submit();
        }
        else{
            alert("Please fill out all the forms before submitting!");
        }
    });

    function addComment(task, commentText) {
        const range = task.getSelection();
        if (!range || range.length === 0) return;
      
        const commentId = "c-" + Date.now(); // unique comment ID
      
        task.formatText(range.index, range.length, "highlight", commentId);
      
        // Save comment somewhere (DB, array, sidebar)
        comments[commentId] = {
          text: commentText,
          created: new Date(),
          range,
        };
      
        console.log("Comment added:", comments[commentId]);
      }
})