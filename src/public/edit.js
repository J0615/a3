const form = document.querySelector('.url-form-edit');
const result = document.querySelector('.result-section-edit');

const b1 = document.getElementById('submit1');
const b2 = document.getElementById('submit2');

b1.addEventListener('click', () => {

    const shortinput = document.querySelector('.url-input-edit-short');
    const longinput = document.querySelector('.url-input-edit-long');

    console.log("here")
    console.log(shortinput)
    console.log(longinput)

    fetch('/edit/get', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: shortinput.value,
            longurl :longinput.value,
        })
    })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            while (result.hasChildNodes()) {
                result.removeChild(result.lastChild);
            }

            result.insertAdjacentHTML('afterbegin', `
        <div class="result">
            <h3>Successfully edited!</h3>
        </div>
      `)
        })
        .catch(console.error)
});

//
// const form2 = document.querySelector('.url-form-new')
//
// form2.addEventListener('submit-new', event => {
//     event.preventDefault();
//     const shortinput = document.querySelector('.url-input-edit');
//     const longinput = document.querySelector('.url-input-new');
//
//     fetch('/edit/put', {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             url: shortinput.value,
//             longurl :longinput.value,
//         })
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw Error(response.statusText);
//             }
//             return response.json();
//         })
//         .then(data => {
//             while (result.hasChildNodes()) {
//                 result.removeChild(result.lastChild);
//             }
//
//             result.insertAdjacentHTML('afterbegin', `
//         <div class="result">
//             <h3>Successfully updated!</h3>
//         </div>
//       `)
//         })
//         .catch(console.error)
// });





//Delete button
b2.addEventListener('click', () => {
    const input = document.querySelector('.url-input-edit-short');
    fetch('/edit/delete', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: input.value,
        })
    })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            while (result.hasChildNodes()) {
                result.removeChild(result.lastChild);
            }
            result.insertAdjacentHTML('afterbegin', `
        <div>
            <h3>Successfully deleted!</h3>
        </div>
      `)
        })
        .catch(console.error)
});

