<?php

class SearchTerm {
    public String $label;
    public String $dbfield;
    public bool $exact;
    public $search;
    public function substitute() {}
}

class Searcher extends DatabaseCaller {
    private $terms; // SearchTerm[]
    public function interpret(String $terms) {
        $this->terms = $this->generateTerms($terms);
    }
    private function generateTerms(String $terms) {
    }
    private function search() {
        $sql = 'select * 
            from TBL
            where ';
        $params = [];
        foreach ($this->terms as $t) {
            $sql .= $t->substitute();
            $params []= $t->search;
            if ($t !== array_key_last($this->terms)) $sql .= ' and ';
        }
        $res = $this->db->retrieve($sql, $params);
        $this->escapeIfNull($res, 'Could not complete search', false);
        return $res;
    }
}

?>
