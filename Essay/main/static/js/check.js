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

        //Will be used for highlights
        let baseDelta = new Delta(essay_delta);

        //Highlight Logic:
        //Inside existing comment → nothing happens
        //Exactly the comment → comment is removed
        //Overlaps → highlight only part outside comment
        //Includes comment → old comment removed, highlight new text
        //No overlapping comments allowed

        //[1], [2] indexes should not be counted at all
        essay.on('selection-change', (range, oldRange, source) => {
            if (!range || range.length === 0) return;

            const { start, finish } = recalc_range(range.index, range.index + range.length);
            comments = add_comment(comments, start, finish);
            
            // reindex:
            comments = comments.map((c, i) => ({
                ...c,
                index: i + 1
            }));

            redrawHighlights(essay, comments);
        });

        function recalc_range(start, finish) {
            if (comments.length === 0) {
                return { start, finish };
            }
        
            // 1. Сначала считаем, где в "визуальном" тексте стоят маркеры [1], [2], ...
            const markers = [];
            let extra = 0;  // суммарная длина всех предыдущих маркеров
        
            for (let i = 0; i < comments.length; i++) {
                const c = comments[i];
                const overhead = 2 + (Math.floor((i + 1) / 10) + 1); // длина [i+1]
        
                const visualCommentFinish = c.finish + extra; // где заканчивается подсветка в визуальном тексте
                const markerStart = visualCommentFinish;       // здесь начинается "[i]"
                const markerEnd = markerStart + overhead;      // здесь заканчивается "[i]"
        
                markers.push({ markerStart, markerEnd, overhead });
        
                extra += overhead;
            }
        
            let newStart = start;
            let newFinish = finish;
        
            // 2. Если выделение попало внутрь маркера, сдвигаем его к границе
            for (const m of markers) {
                // начало внутри [n] → сдвинуть до конца маркера
                if (newStart >= m.markerStart && newStart < m.markerEnd) {
                    newStart = m.markerEnd;
                }
                // конец внутри [n] → сдвинуть к началу маркера
                if (newFinish > m.markerStart && newFinish <= m.markerEnd) {
                    newFinish = m.markerStart;
                }
            }
        
            // 3. Теперь вычитаем длину тех маркеров, которые полностью слева от start/finish
            let logicalStart = newStart;
            let logicalFinish = newFinish;
        
            for (const m of markers) {
                if (newStart >= m.markerEnd) {
                    logicalStart -= m.overhead;
                }
                if (newFinish >= m.markerEnd) {
                    logicalFinish -= m.overhead;
                }
            }
        
            return { start: logicalStart, finish: logicalFinish };
        }        

        function add_comment(comments, start_index, finish_index) {
            if (start_index > finish_index) {
                [start_index, finish_index] = [finish_index, start_index];
            }
        
            // 1) Empty list
            if (comments.length === 0) {
                comments.push({ start: start_index, finish: finish_index });
                return comments;
            }
        
            // 2) Inside existing comment logic (+ toggle on exact match)
            for (let i = 0; i < comments.length; i++) {
                const c = comments[i];
                if (c.start <= start_index && c.finish >= finish_index) {
                    // exact same -> remove (toggle)
                    if (c.start === start_index && c.finish === finish_index) {
                        comments.splice(i, 1);
                    }
                    return comments;
                }
            }
        
            // 3) Engulf logic: remove comments fully inside new one (iterate backwards!)
            for (let i = comments.length - 1; i >= 0; i--) {
                const c = comments[i];
                if (c.start >= start_index && c.finish <= finish_index) {
                    comments.splice(i, 1);
                }
            }
        
            // 4) Find insertion index such that comments stay sorted by start
            let insertIndex = 0;
            while (insertIndex < comments.length && comments[insertIndex].start < start_index) {
                insertIndex++;
            }
        
            // 5) Adjust against left neighbor (avoid overlap)
            if (insertIndex > 0) {
                const left = comments[insertIndex - 1];
                if (left.finish >= start_index) {
                    start_index = left.finish + 1;
                }
            }
        
            // 6) Adjust against right neighbor (avoid overlap)
            if (insertIndex < comments.length) {
                const right = comments[insertIndex];
                if (right.start <= finish_index) {
                    finish_index = right.start - 1;
                }
            }
        
            // 7) After adjustments, maybe nothing to insert
            if (start_index > finish_index) {
                return comments;
            }
        
            // 8) Insert at the correct position
            comments.splice(insertIndex, 0, { start: start_index, finish: finish_index });
            return comments;
        }        

        function redrawHighlights(essay, comments) {
            const Delta = Quill.import("delta");
        
            // 1) reset the editor to the pristine delta
            essay.setContents(baseDelta);
        
            // 2) no comments? done
            if (!comments.length) return;
        
            // 3) build highlight delta
            let delta = new Delta();
            let pos = 0;
        
            for (const c of comments) {
                const gap = c.start - pos;
                const length = c.finish - c.start;
        
                if (gap > 0) delta = delta.retain(gap);
        
                delta = delta.retain(length, { highlight: `c-${c.index}` });
                delta = delta.insert(`[${c.index}]`);
        
                pos = c.finish;
            }
        
            // 4) apply highlight delta
            essay.updateContents(delta);
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
    
        // ---- FEEDBACK ----
        const feedbackInput = document.getElementById('feedback-input');
        const textDelta = feedback.getContents();
        feedbackInput.value = JSON.stringify(textDelta);
    
        // ---- COMMENTS ----
        const commentsInput = document.getElementById('comments-input');
        commentsInput.value = JSON.stringify(comments);  // <= your global comments[] array
        console.log(commentsInput.value);
        console.log(comments);
    
        // ---- EMPTY CHECK ----
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
      }
})