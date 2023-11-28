const knex = require("../database/knex");

class NotesController{
    async create(req, res){
        const { title, description, tags, links } = req.body
        const  user_id  = req.user.id

       const note_id = await knex("notes").insert({
            title, 
            description,
            user_id
        })

        const noteIdString = String(note_id)

        const linksInsert = links.map(link => {
            return{
                note_id: noteIdString,
                url:link
            }
        })

        await knex("links").insert(linksInsert)


        const tagsInsert = tags.map(name => {
            return{
                name,
                note_id: noteIdString,
                user_id
            }
        })

        await knex("tags").insert(tagsInsert)

        return res.status(200).json()
    }

    async show(req, res){
        const { id } = req.params

        const note = await knex("notes").where({id}).first()
        const tags = await knex("tags").where({note_id: id}).orderBy("name")
        const links = await knex("links").where({note_id: id}).orderBy("created_at")

        return res.status(200).json({
            ...note,
            tags,
            links
        })
    }

    async delete(req,res){
        const { id } = req.params

        await knex("notes").where({id}).delete()

        return res.status(200).json()
    }

    async index(req,res){
        const { title, tags } = req.query
        const user_id = req.user.id

        let notes;

        if(tags){
            const filterTags = tags.split(',').map(tag => tag.trim())
            
            notes = await knex("tags")
            //tabela que eu quero fazer referencia(notes)
            .select([
                "notes.id",
                "notes.title",
                "notes.user_id"
            ])
            //ligando o id do usuário da notes com o usuário da query
            .where("notes.user_id", user_id)
            //ligando titulo da nota da notes com o titulo da pesquisa da query
            .whereLike("notes.title", `%${title}%`)
            //ligando o nome da tag da tabela tags com a tag de pesquisa da query
            .whereIn("name", filterTags)
            //informando as tabelas que vou ligar
            .innerJoin("notes", "notes.id", "tags.note_id")
            //não trazer notas repetidas
            .groupBy("notes.id")
            //ordenando por ordem alfabetica
            .orderBy("notes.title")

        }else{
            notes = await knex("notes")
            .where({user_id})
            .whereLike("title", `%${title}%`)
            .orderBy("title")
        
        }
        
        //selecionando todas as tags que o usuário criou
        const userTags = await knex("tags").where({user_id})

        //Percorrendo as notas com referencia da pesquisa e filtrando(verificando) se alguma tag é da nota que ele pesquisou
        const notesWithTags = notes.map(note => {
            const noteTags = userTags.filter(tag => tag.note_id === note.id)
            
            return {
                ...note,
                tags: noteTags
            }
        })

        return res.status(200).json(notesWithTags)
    }
};

module.exports = NotesController;