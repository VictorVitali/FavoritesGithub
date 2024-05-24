export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint).then(data => data.json())
            .then(({ login, name, public_repos, followers }) => ({
                login,
                name,
                public_repos,
                followers
            }))
    }
}

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()

    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    remove(user) {
        const filteredEntries = this.entries
            .filter(entry => entry.login !== user.login)
        this.entries = filteredEntries
        this.update()
        this.save()
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            //Nos testes se não tivesser o .toLowerCase e o usuario tivesse letra maiuscula era possivel adicionar mais de 1.
            const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())

            if (userExists){
                throw new Error('Usuário já favoritado')
            }

            const githubUser = await GithubUser.search(username)

            if (githubUser.login === undefined) {
                throw new Error('Usuário não Encontrado!')
            }
            this.entries = [githubUser, ...this.entries]
            this.update()
            this.save()
        }
        catch (error) {
            alert(error.message)
        }
    }

}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value)
        }
    }


    update() {
        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow()
            row.querySelector('.user img').src = `https://GitHub.com/${user.login}.png`
            row.querySelector('.user img').alt = `imagem de ${user.name}`
            row.querySelector('.user a').href = `https://GitHub.com/${user.login}/`
            row.querySelector('.user p').textContent = `${user.name}`
            row.querySelector('.user span').textContent = `${user.login}`
            row.querySelector('.followers').textContent = `${user.followers}`
            row.querySelector('.repositories').textContent = `${user.public_repos}`

            row.querySelector('.remove').onclick = () => {
                const isOK = confirm('Are you sure you want to remove this user?')
                if (isOK) { this.remove(user); }

            }

            this.tbody.append(row)
        })

    }

    createRow() {
        const tr = document.createElement('tr')

        const inner =
            `
            <td class="user">
                <img src="" alt="">
                <a href="" target="_blank">
                    <p></p>
                    <span></span>
                </a>
            </td>
            <td class="repositories"></td>
            <td class="followers">/td>
            <td>
                <button class='remove'>&times;</button>
            </td>
        </tr>
        `

        tr.innerHTML = inner

        return tr
    }


    removeAllTr() {

        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            });
    }
}