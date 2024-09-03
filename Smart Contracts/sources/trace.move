
module trace::my_module {
    public struct Asset has copy,store,drop {
        owner: u64,
        video: u64,
        fake: bool
    }


    public struct List has key,store{
        id: UID,
        list: vector<Asset>
    }

    public fun create_Asset( owner:u64,video: u64, fake:bool): Asset {
        Asset {
            owner: owner,
            video: video,
            fake: fake
        }
    }

    public fun create_list(ctx: &mut TxContext){
        let l=List{
            id:object::new(ctx),
            list:vector::empty<Asset>()
        };
        transfer::share_object(l);
    }

    public fun list_Assets(l: &mut List,owner:u64,video: u64, fake:bool){
        let i=create_Asset(owner,video, fake);
        vector::push_back<Asset>(&mut l.list, i);
    }

     public fun get_list(self: &List): vector<Asset> {
        self.list
    }

}